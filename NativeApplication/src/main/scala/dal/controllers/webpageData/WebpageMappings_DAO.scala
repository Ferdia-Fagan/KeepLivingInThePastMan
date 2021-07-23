package dal.controllers.webpageData

import dal.QueryLibrary.WebpageMappingsComponent_QueryAPI
import h2.webpageData.WebpageMappingsComponent
import h2.webpageData.WebpageMappingsComponent.Webpage
import org.slf4j.LoggerFactory
import slick.jdbc.H2Profile
import slick.jdbc.H2Profile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

//trait WebpageMappings_DAL_SyncSystemAPI{
//
//}
//
trait WebpageMappings_DAO_QueryAPI{
  def getWebpageLoggingIdWithHostnameIdReq(hostnameIdReq: Query[Rep[Int], Int, Seq]): Future[Seq[Long]]
}

class WebpageMappings_DAO(val db:Database) extends WebpageMappingsComponent_QueryAPI
                                            with WebpageMappings_DAO_QueryAPI {

  private val logger = LoggerFactory.getLogger(classOf[WebpageMappings_DAO])

//  def create(webPageDetails: Webpage):Unit = {
//    db.run(webpageMappingT += webPageDetails)
//  }

  def createAndGetIndex(webPageDetails: Webpage): Future[Long] = {
    db.run((webpageMappingT returning webpageMappingT.map(_.id)) += webPageDetails)
  }

  def findAll(): Future[Seq[Webpage]] = {
    db.run(webpageMappingT.result)

  }

  def findByHostAndPathName(hostName: String, pathName: String): Future[Option[Webpage]] = {
    val getWebpageWithHostnameAndPathname_Req = findWebpageBy_HostnameAndPathName(hostName,pathName)
      .take(1)
      .result
      .headOption
    db.run(getWebpageWithHostnameAndPathname_Req)
  }

  def recordWebPageAsIndexed(id: Long): Unit = {
    val updateWebpageAsIndexed_Req = findWebpageBy_WebpageLoggingId(id).map(_.isIndexed).update(true)
    db.run(updateWebpageAsIndexed_Req)
  }

  def recordWebpageHostnameId(hostname: String,hostnameId: Int): Unit = {
    val makeWebpagesWithHostnameId_Req = findWebpagesBy_Hostname(hostname)
      .map(_.hostnameId)
      .update(Some(hostnameId))
    db.run(makeWebpagesWithHostnameId_Req)
  }

  def updateWebpage(webpageLoggingId: Long, updateWPMD: Array[(String, Object)]): Unit = {
    val updatePart = updateWPMD.map{
      case (param,updatedValue) => {
        s"$param = '$updatedValue'"
      }
    }.mkString(",")

    val q = sqlu"""update WebpageMapping SET #$updatePart where id=${webpageLoggingId}"""

    db.run(q)
  }

  /**
   * this is a join request
   * to join hostnameIds to webpageLoggingIds
   * @param hostnameIdReq
   * @return
   */
  def getWebpageLoggingIdWithHostnameIdReq(hostnameIdReq: Query[Rep[Int], Int, Seq]): Future[Seq[Long]] = {
    val getWebpageIdsFromHostnameIds = hostnameIdReq.join(webpageMappingT).on(_ === _.hostnameId).map(_._2.id)

    db.run(getWebpageIdsFromHostnameIds.result)

  }

}


