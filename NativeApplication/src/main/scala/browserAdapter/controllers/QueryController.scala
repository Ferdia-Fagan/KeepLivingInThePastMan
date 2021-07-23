package browserAdapter.controllers

import h2.webpageData.WebpageSearchDataComponent.WebpageSearchData
import dal.controllers.autoCollector.{AutoAnnotator_DAO, AutoAnnotator_DAO_QueryAPI}
import dal.controllers.browsingData.{DailyWebpageVisits_DAL_SyncSystem, DailyWebpageVisits_DAO, DailyWebpageVisits_DAO_QueryAPI}
import dal.controllers.webpageData.{BookmarksMappings_DAO, BookmarksMappings_DAO_QueryAPI, WebpageMappings_DAO, WebpageMappings_DAO_QueryAPI, WebpageSearchData_DAO, WebpageSearchData_DAO_QueryAPI, WebpageTagMappings_DAO, WebpageTagMappings_DAO_QueryAPI}
import indexing.Index_Queryer
import indexing.IndexerBM25
import org.slf4j.{Logger, LoggerFactory}

import scala.concurrent.ExecutionContext.Implicits.global
import java.time.LocalDate
import scala.concurrent.Future
import scala.util.{Failure, Success}
import com.fasterxml.jackson.databind.JsonNode
import session.Utils.{MessageMapper, formatter}

import scala.collection.mutable

import session.BrowserSessionData

/**
 * Query controller.
 * This will eventually contain all user command interactions.
 */
class QueryController(val browserSessionData: BrowserSessionData,
                      val webpageMappings_DAO: WebpageMappings_DAO_QueryAPI,
                      val webpageSearchData_DAO: WebpageSearchData_DAO_QueryAPI,
                      val bookmarksMappings_DAO: BookmarksMappings_DAO_QueryAPI,
                      val webpageTagMappings_DAO: WebpageTagMappings_DAO_QueryAPI,
                      val dailyWebpageVisits_DAO: DailyWebpageVisits_DAO_QueryAPI,
                      val autoAnnotator_DAO: AutoAnnotator_DAO_QueryAPI,
                      val documentIndex: Index_Queryer
                      ){

  import browserAdapter.InputOutputAdapter.sendMessageToBrowserPlugin

  val logger: Logger = LoggerFactory.getLogger(classOf[QueryController])

  /**
   * Handles search query request from browser plugin.
   * Sideeffect: send results of search as a message back.
   * @param requestResponseId
   * @param queryMessage
   */
  def handle_Query(requestResponseId: Int, queryMessage: JsonNode): Unit ={
    import protocol.Requests.Query._

    logger.info("handle_Query:")

    if(documentIndex.isIndexEmpty()){
      val queryResultsResponse = MessageMapper.GetValueAsString(Query_Resp(requestResponseId,Array()))
      sendMessageToBrowserPlugin(queryResultsResponse)
    }

    val query =  MessageMapper.GetMessageFromJsonNode(queryMessage, classOf[Query_Req])
//    logger.info("the query : " + query)


    val startingWebpageFilter: mutable.Set[Long] = if(query.filterByToday) browserSessionData.webpagesOpenedToday else mutable.Set.empty
//    logger.info("the query by today filter was set to: " + query.filterByToday)
//    logger.info(startingWebpageFilter.mkString(", "))

    def getWebpageFilter[A,B](dataToRetrieveWebpageIdFilter: Option[A], queryFunction: A => Future[Seq[Long]]): Option[Future[Seq[Long]]] ={
      dataToRetrieveWebpageIdFilter match {
        case Some(dataToRetrieveWebpageIdFilter) =>{
          Some(queryFunction(dataToRetrieveWebpageIdFilter))
        }
        case None => None
      }
    }

    val listOfWebpageFilters = Future.sequence(List(
      // Get webpageLoggingIds from tagIds
      getWebpageFilter(
        query.tags,
        webpageTagMappings_DAO.getAllUniqueWebpagesIdsWithTags
      ),
      // Get webpageLoggingIds from bookmarks
      getWebpageFilter(
        query.bookmarks,
        bookmarksMappings_DAO.getAllWebpagesIdsFromBookmarkFolders
      ),
      // get webpageLoggingIds from filter dates
      getWebpageFilter(
        query.filterDates,
        (filterDates_AsStrings: List[String]) => {
          val filterDates = filterDates_AsStrings.map(date => {
            LocalDate.parse(date,formatter)
          })
//          logger.info("filter dates after formating: " + filterDates.mkString(", "))


          val getWebpagesVisitedOnDates_Req = dailyWebpageVisits_DAO.getWebpagesVisitedOnDates(
            filterDates
          )

          getWebpagesVisitedOnDates_Req.map(_.flatten)
        }
      ),
      // get webpageLoggingIds from hostIds filtered by tagIds
      getWebpageFilter(
        query.tags,
        webpageMappings_DAO.getWebpageLoggingIdWithHostnameIdReq _ compose autoAnnotator_DAO.getHostnameIdsFromTagIds _
      )
    ).flatten).map({
      case Nil => if(query.filterByToday){Some(Set.empty ++ startingWebpageFilter)} else None
      case webpageFilters => {
//        logger.info("the seperate parts of webpage filter are:")
//        logger.info("the starting list: " + startingWebpageFilter.mkString(", "))
//        logger.info("the list of other filters: " + webpageFilters.mkString(", "))
        // get intersection between all the different webpageLoggingIds filtered groups
        Some(Set.empty ++ webpageFilters.foldLeft(startingWebpageFilter)((totalWebpageFilter, webpageFilter) => {
          totalWebpageFilter ++ (if(totalWebpageFilter.isEmpty){
            webpageFilter
          } else {
            webpageFilter.filter(webpageLoggingId => totalWebpageFilter.contains(webpageLoggingId))
          })
        }))
      }
    })



    listOfWebpageFilters.onComplete{
      case Success(webpageLoggingIdsToFilter) => {

//        logger.info("IndexerBM25.query(webpageLoggingIdsToFilter,query.query) : " + webpageLoggingIdsToFilter.size)
//        logger.info("IndexerBM25.query(webpageLoggingIdsToFilter,query.query) : " + webpageLoggingIdsToFilter.mkString(", "))

        val queryResults =
          documentIndex.query(webpageLoggingIdsToFilter,query.query)

        webpageSearchData_DAO.getWebpagesSearchDataById(queryResults).onComplete{
          case Success(queryResultsSearchData) => {


            val webpagesInOrder = for { // TODO: this mite need refactoring. I am doing it this way to reduce creating to many futures.
              webpageLoggingId <- queryResults
              WebpageSearchData(id, title, url, imgUrl) <- queryResultsSearchData
              if webpageLoggingId == id
            } yield ((id, title, url, imgUrl))

            val queryResultsResponse = MessageMapper.GetValueAsString(Query_Resp(requestResponseId,webpagesInOrder))

//            logger.info("queryResultsResponse: \n" + queryResultsResponse)

            sendMessageToBrowserPlugin(queryResultsResponse)

//            logger.info("query webpageIds in order are: " + queryResults.mkString(", "))
//            logger.info("query results not in order are: " + queryResultsSearchData.mkString(", "))
//            logger.info("query results in order are: " + webpagesInOrder.mkString(", "))
          }
        }
      }
      case Failure(exception) => {
        logger.error("failed to retrieve webpageLoggingIds")
      }
    }
  }

}
