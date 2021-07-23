package dal.QueryLibrary

import h2.webpageData.WebpageTagsMappingsComponent

import slick.jdbc.H2Profile.api._

trait WebpageTagMappingsComponent_QueryAPI extends WebpageTagsMappingsComponent{


  // GET:
  def findTaggedWebpageBy_WebpageLoggingId(webpageLoggingId: Long) =
    webpageTagsMappingT.filter(_.webpageLoggingId === webpageLoggingId)

  def getTaggedWebpagesBy_TagIds(tagIds: Array[Int]) =
    webpageTagsMappingT.filter(_.tagId inSet(tagIds))

  def getTaggedWebpagesBy_WebpageLoggingIdAndTagIds(webpageLoggingId: Long, tagIds: Array[Int]) =
    webpageTagsMappingT.filter(el =>{
      el.webpageLoggingId === webpageLoggingId &&
        el.tagId.inSet(tagIds)
    })


}
