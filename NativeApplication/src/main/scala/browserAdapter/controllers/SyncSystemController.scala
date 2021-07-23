package browserAdapter.controllers

import protocol.Messages.{AddHostnameId, NewAutoAnnotor, UpdateAutoAnnotor}
import com.fasterxml.jackson.annotation.JsonProperty
import h2.webpageData.WebpageMappingsComponent.Webpage
import h2.webpageData.WebpageTagsMappingsComponent.WebpageTag
import indexing.{Index_Management, IndexerBM25}
import org.slf4j.{Logger, LoggerFactory}

import scala.concurrent.ExecutionContext.Implicits.global
import java.lang.Thread.sleep
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.util.{Failure, Success}
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import dal.controllers.autoCollector.AutoAnnotator_DAO
import dal.controllers.browsingData.{DailyWebpageVisits_DAL_SyncSystem, DailyWebpageVisits_DAO}
import session.Utils.MessageMapper
import session.BrowserSessionData
import dal.controllers.webpageData.{BookmarksMappings_DAO, WebpageMappings_DAO, WebpageSearchData_DAO, WebpageTagMappings_DAO}

/**
 * This is for passive interactions between the browser plugin
 * and this application.
 */
class SyncSystemController(val browserSessionData:BrowserSessionData,
                           val webpageMappings_DAO: WebpageMappings_DAO,
                           val webpageSearchData_DAO: WebpageSearchData_DAO,
                           val bookmarksMappings_DAO: BookmarksMappings_DAO,
                           val webpageTagMappings_DAO: WebpageTagMappings_DAO,
                           val dailyWebpageVisits_DAO: DailyWebpageVisits_DAO,
                           val autoCollector_DAO: AutoAnnotator_DAO,
                           val documentIndex: Index_Management
                          ) {
  import browserAdapter.InputOutputAdapter.sendMessageToBrowserPlugin

  val logger: Logger = LoggerFactory.getLogger(classOf[SyncSystemController])

  val updateReportController =
    new SyncSystemController_UpdateReport(webpageMappings_DAO,bookmarksMappings_DAO,webpageTagMappings_DAO)


  /**
   * handles logging of web page visit from browser plugin.
   * This is called from browser plugin when it hasn't cached the current
   * webpage during session.
   * @param requestResponseId
   * @param webPageVisitReport
   */
  def handle_ReportWebpageVisit(requestResponseId: Int, webPageVisitReport:JsonNode):Unit={
    import protocol.Requests.LogWebpageVisit._

//    logger.info("handling: logging web page visit")
    val logWebpageVisitReq = MessageMapper.GetMessageFromJsonNode(webPageVisitReport, classOf[LogWebpageVisit_Req])
//    logger.info("the message arrived requestResponseId : " + requestResponseId)
//    logger.info("the message arrived : " + logWebpageVisitReq)

    val webPageIfExists = webpageMappings_DAO.findByHostAndPathName(logWebpageVisitReq.hostName,logWebpageVisitReq.pathName)

    webPageIfExists.andThen {
      case Success(Some(webpage)) => {
//        logger.info("web page already visited : " + webpage)
//        logger.info("web page logging id: " + webpage.getTheId())

        val metadataRoot: ObjectNode = MessageMapper.GetBlankJsonObject()
        if(webpage.isTagged){
//          logger.info("webpage has tags. Retrieve web page")
          webpageTagMappings_DAO.getWebpageTags(webpage.getTheId()).onComplete({
            case Success(webpageTags) => {
//              logger.info("webpage tags are : " + webpageTags)
              metadataRoot.putArray("tags").addAll(MessageMapper.GetJsonNodeFromJson(webpageTags): ArrayNode)

              val resp = MessageMapper.GetValueAsString(LogWebpageVisit_Resp(requestResponseId,webpage.getTheId(),
                webpage.isIndexed,true,metadataRoot))
              sendMessageToBrowserPlugin(resp)
            }
          })
        }else{
          val resp = MessageMapper.GetValueAsString(LogWebpageVisit_Resp(requestResponseId,webpage.getTheId(),
            webpage.isIndexed,webpage.isTagged,metadataRoot))
          sendMessageToBrowserPlugin(resp)
        }

        browserSessionData.webpagesOpenedToday.add(webpage.getTheId())
      }
      case Success(_) => {
//        logger.info("web page has not been visited yet")
        val createdWebPageWithId = webpageMappings_DAO.
          createAndGetIndex(Webpage(None, logWebpageVisitReq.hostName,
            logWebpageVisitReq.pathName,hostnameId=logWebpageVisitReq.hostnameId))

        createdWebPageWithId.onComplete({
          case Success(webPageId) => {
            val metadataRoot: ObjectNode = MessageMapper.GetBlankJsonObject()
            val resp = MessageMapper.GetValueAsString(LogWebpageVisit_Resp(requestResponseId,webPageId, false,false,metadataRoot))
            sendMessageToBrowserPlugin(resp)
//            logger.info("the webpageid is: " + webPageId)
//            logger.info("the webpageid is: " + browserSessionData.webpagesOpenedToday.toString())
            browserSessionData.webpagesOpenedToday.add(webPageId)
          }
          case Failure(exception) => logger.error("the error is: " + exception)
        })


      }
      case _ => logger.error(("failure: handle_WebPageVisited"))
    }


    Await.ready(webPageIfExists, Duration.Inf)
  }

  /**
   *  Handles webpage scrapings for webpage from browser plugin.
   * @param webpageScrapingsReport
   */
  def handle_WebPageScrapings(webpageScrapingsReport:JsonNode): Unit = {
    import protocol.Messages.WebPageScrapings

//    logger.info("handling: handle_WebPageScrapings")
    val webPageScrapings =  MessageMapper.GetMessageFromJsonNode(webpageScrapingsReport, classOf[WebPageScrapings])

    documentIndex.indexDocument(webPageScrapings.webpageLoggingId,webPageScrapings.scrapings)

//    logger.info("about to update webpageSearchData")
    webpageSearchData_DAO.addWebpageSearchData(webPageScrapings.webpageLoggingId,webPageScrapings.title,
      webPageScrapings.url, webPageScrapings.imgUrl)

//    logger.info("done: handle_WebPageScrapings")
  }

  /**
   * Handles user added metadata (annotations) update report from browser plugin,
   * and updates relevent parts of state/DB.
   * @param updates
   */
  def handle_UpdateReport(updates:JsonNode): Unit ={
//    logger.info("handling: UpdateWebPagesMetaDataToBeIndexed")
//    logger.info("handling: UpdateWebPagesMetaDataToBeIndexed : " + updates)

    updates.fields.forEachRemaining( node => {
//      logger.info("handling the update report : " + node.getKey)
      updateReportController.UPDATE_REPORT_HANDLER(node.getKey,node.getValue)
    })
  }

  def handle_AddNewAutoAnnotator(newAutoAnnotator:JsonNode): Unit ={
    val webPageScrapings =  MessageMapper.GetMessageFromJsonNode(newAutoAnnotator, classOf[NewAutoAnnotor])

//    logger.info("handle_AddNewAutoCollector: " + webPageScrapings.toString)

    autoCollector_DAO.addNewAutoAnnotator(webPageScrapings)
  }

  def handle_UpdateAutoCollector(updateReportForAutoCollector:JsonNode): Unit = {
    val updatedAutoCollector =  MessageMapper.GetMessageFromJsonNode(updateReportForAutoCollector, classOf[UpdateAutoAnnotor])

//    logger.info("handle_UpdateAutoCollector: " + updatedAutoCollector.toString)

    autoCollector_DAO.updateAutoAnnotator(updatedAutoCollector)
  }

  def handle_DeleteAutoCollector(autoCollectorIdMessage: JsonNode): Unit = {
    val autoCollectorId = autoCollectorIdMessage.intValue()

//    logger.info("handle_DeleteAutoCollector: " + autoCollectorId)

    autoCollector_DAO.deleteAutoAnnotator(autoCollectorId)
  }

  /**
   * mark all webpages from hostname with hostnameId.
   * This way can filter hostnameIds by tagIds, and use this to get webpageLoggingIds
   * @param hostnameWithId
   */
  def handle_AddHostnameId(hostnameWithId: JsonNode): Unit = {
    val theHostnameAndId =  MessageMapper.GetMessageFromJsonNode(hostnameWithId, classOf[AddHostnameId])

//    logger.info("handle_AddHostnameId: " + theHostnameAndId)

    webpageMappings_DAO.recordWebpageHostnameId(theHostnameAndId.hostname,theHostnameAndId.hostnameId)
  }

  def cleanUp(): Unit = {
    this.browserSessionData.cleanUp()
    this.documentIndex.cleanUp()
  }

}

/**
 * uses User 'added web page annotations' update report
 * (so far is made of tags and bookmarks, but in future will also contain notes and highlights).
 * {@link SyncSystemController_UpdateReport#UPDATE_REPORT_HANDLER}
 */
class SyncSystemController_UpdateReport(val webpageMappings_DAL: WebpageMappings_DAO,
                                        val bookmarksMappings_DAL: BookmarksMappings_DAO,
                                        val webpageTagMappings_DAL: WebpageTagMappings_DAO){

  import SyncSystemController_UpdateReport._

  val logger:Logger = LoggerFactory.getLogger("SyncSystemController_UpdateReport")

  /**
   * Takes updateReports and applies them.
   */
  def UPDATE_REPORT_HANDLER(updateReportType:String,updateReport:JsonNode): Unit = updateReportType match {
    case "webpagesUpdateReport" => updateWebpagesMetadataWithUpdateReport(updateReport)
    case "bookmarkUpdateReport" => updateBookmarksWithUpdateReport(updateReport)
    case "tagsUpdateReport" => updateTagsWithUpdateReport(updateReport)
  }


  private def updateWebpagesMetadataWithUpdateReport(updateReportNode:JsonNode): Unit ={

//    logger.info("handling: UpdateWebPagesMetaDataToBeIndexed : " + updateReportNode)

//    logger.info("updatereport : " + updateReportNode)

    val updateReport =  MessageMapper.GetMessageFromJsonNode(updateReportNode, classOf[Array[WPMetaDataUpdates]])

    updateReport.foreach(singleWebPageUpdate => {
      webpageMappings_DAL.updateWebpage(singleWebPageUpdate.webpageLoggingId, singleWebPageUpdate.updates)
    })

  }

  private def updateBookmarksWithUpdateReport(updateReportNode:JsonNode): Unit = {
//    logger.info("updateBookmarksWithUpdateReport updateReport : " + updateReportNode)

    if(updateReportNode.has("bookmarksAddedReport")){
      MessageMapper.GetMessageFromJsonNode(updateReportNode.get("bookmarksAddedReport"), classOf[Array[Array[Int]]]).foreach({
        case Array(bookmarkId,parentBookmarkId,webpageLoggingId) => bookmarksMappings_DAL.addBookmarkForWebpage(bookmarkId,parentBookmarkId,webpageLoggingId)
      })
    }

    if(updateReportNode.has("bookmarksMovedReport")){
      MessageMapper.GetMessageFromJsonNode(updateReportNode.get("bookmarksMovedReport"), classOf[Array[Array[Int]]]).foreach({
        case Array(bookmarkId,newParentBookmarkId) =>  bookmarksMappings_DAL.moveBookmark(bookmarkId,newParentBookmarkId)
      })
    }

    if(updateReportNode.has("bookmarksDeletedReport")){
      val bookmarksDeletedReport = MessageMapper.GetMessageFromJsonNode(updateReportNode.get("bookmarksDeletedReport"), classOf[Array[Int]])
      bookmarksMappings_DAL.remove_BookmarksByIds(bookmarksDeletedReport)
    }

  }

  private def updateTagsWithUpdateReport(updateReportNode:JsonNode): Unit = {
//    logger.info("updateTagsWithUpdateReport updateReport : " + updateReportNode)

    updateReportNode.elements().forEachRemaining(webpageTagsUpdateReport =>  {
      val webpageLoggingId = webpageTagsUpdateReport.get(0).asInt()
      val updateReport = webpageTagsUpdateReport.get(1)

      val tagsAdded_Ids = MessageMapper.GetMessageFromJsonNode(updateReport.get(0),classOf[Array[Int]])
      val tagsToAdd = tagsAdded_Ids.map(new WebpageTag(_,webpageLoggingId))
      webpageTagMappings_DAL.addTagsToWebpage(tagsToAdd)

      val tagsRemoved_Ids = MessageMapper.GetMessageFromJsonNode(updateReport.get(1),classOf[Array[Int]])
      webpageTagMappings_DAL.removeTagsFromWebpage(webpageLoggingId,tagsRemoved_Ids)
    })
  }
}

object SyncSystemController_UpdateReport{
  case class WPMetaDataUpdates(@JsonProperty("webpageLoggingId") webpageLoggingId: Long,
                               @JsonProperty("updates") updates: Array[(String,Object)])
}

