package dal.controllers.webpageData

import org.slf4j.{Logger, LoggerFactory}
import slick.jdbc.H2Profile.api._
import h2.webpageData.WebpageSearchDataComponent
import h2.webpageData.WebpageSearchDataComponent.WebpageSearchData

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Success

trait WebpageSearchData_DAO_QueryAPI {
  def getWebpagesSearchDataById(webpageLoggingIds: Array[Long]): Future[Seq[WebpageSearchData]]
}

class WebpageSearchData_DAO(val db:Database) extends WebpageSearchDataComponent
                                              with WebpageSearchData_DAO_QueryAPI {
  import h2.webpageData.WebpageSearchDataComponent.WebpageSearchData


  private val logger: Logger = LoggerFactory.getLogger(classOf[WebpageSearchData_DAO])

  def addWebpageSearchData(webpageLoggingId: Long, title: String,
                                    url: String, imgUrl: String): Unit = {
    val addWebpageSearchDataReq = webpageSearchDataT += WebpageSearchData(webpageLoggingId, title,
      url, imgUrl)
    db.run(addWebpageSearchDataReq)

  }

  /**
   *
   *
   * @param webpageLoggingIds
   * @return Seq[(webpageLoggingId, title, url, imgUrl)]
   */
  def getWebpagesSearchDataById(webpageLoggingIds: Array[Long]): Future[Seq[WebpageSearchData]] = {

    val getWebpagesSearchDataById = webpageSearchDataT.filter(_.webpageLoggingId inSet(webpageLoggingIds))

    db.run(getWebpagesSearchDataById.result)
  }

  def getAll(): Future[Seq[WebpageSearchData]] = {
    db.run(webpageSearchDataT.result)
  }

}