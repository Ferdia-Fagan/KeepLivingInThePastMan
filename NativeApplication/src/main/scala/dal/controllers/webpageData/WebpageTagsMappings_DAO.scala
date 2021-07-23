package dal.controllers.webpageData

import dal.QueryLibrary.WebpageTagMappingsComponent_QueryAPI
import h2.webpageData.WebpageMappingsComponent.Webpage
import h2.webpageData.WebpageTagsMappingsComponent
import h2.webpageData.WebpageTagsMappingsComponent.WebpageTag
import slick.jdbc.H2Profile.api._
import slick.lifted.{MappedProjection, TableQuery}
import org.slf4j.LoggerFactory

import scala.concurrent.Future

trait WebpageTagMappings_DAO_QueryAPI {
  def getAllUniqueWebpagesIdsWithTags(tagIds: Array[Int]): Future[Seq[Long]]
}

class WebpageTagMappings_DAO(val db:Database) extends WebpageTagMappingsComponent_QueryAPI
                                              with WebpageTagMappings_DAO_QueryAPI {
  import h2.webpageData.WebpageMappingsComponent.Webpage
  import WebpageTagsMappingsComponent.WebpageTag

  private val logger = LoggerFactory.getLogger(classOf[WebpageTagMappings_DAO])

  def addTagsToWebpage(newWebpageTag: Array[WebpageTag]): Unit = {
    val addedTagsReq = webpageTagsMappingT ++= newWebpageTag
    db.run(addedTagsReq)
  }

  def getAllTags(): Future[Seq[WebpageTag]] = {
    db.run(webpageTagsMappingT.result)
  }

  def getWebpageTags(webpageLoggingId: Long): Future[Seq[Int]] = {
    val webpageTagIds = findTaggedWebpageBy_WebpageLoggingId(webpageLoggingId)
      .map(_.tagId)
    db.run(webpageTagIds.result)
  }

//  def getAllWebpagesWithTag(tagId: Int): Future[Seq[Webpage]] = {
//    val action = for {
//      webpageTag <- webpageTagsMappingT if webpageTag.tagId === tagId
//      webpage <- webpageMappingT if webpageTag.webpageLoggingId === webpage.id
//    } yield (webpage)
//    val q = action.result
//
//    db.run(q)
//  }

  def getAllUniqueWebpagesIdsWithTags(tagIds: Array[Int]): Future[Seq[Long]] = {
    val webpagesIdsFromTagIdsReq = webpageTagsMappingT.filter(_.tagId inSet(tagIds))
      .map(_.webpageLoggingId).distinct

    db.run(webpagesIdsFromTagIdsReq.result)
  }

//  /**
//   * // TODO: this is not useful yet
//   * This is useful if want to retrieve <webpageLoggingId, tagId> pairs,
//   * to then use to do more complicated tag filtering.
//   * But, no time.
//   * @param tagIds
//   * @return
//   */
//  def getAllWebpagesWithTags(tagIds: Array[Int]): Future[Seq[Webpage]] = {
//    val getWebpagesWithTags_Req = for {
//      webpageTag <- webpageTagsMappingT if webpageTag.tagId.inSet(tagIds)
//      webpage <- webpageMappingT if webpageTag.webpageLoggingId === webpage.id
//    } yield (webpage)
//
//    db.run(getWebpagesWithTags_Req.result)
//  }

  def removeTagsFromWebpage(webpageLoggingId: Long, tagIds: Array[Int]): Unit = {
    val deleteTagsFromWebpageReq = getTaggedWebpagesBy_WebpageLoggingIdAndTagIds(webpageLoggingId, tagIds)
      .delete
    db.run(deleteTagsFromWebpageReq)
  }
}