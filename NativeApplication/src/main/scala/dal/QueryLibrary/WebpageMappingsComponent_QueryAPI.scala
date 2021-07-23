package dal.QueryLibrary

import h2.webpageData.WebpageMappingsComponent

import slick.jdbc.H2Profile.api._

trait WebpageMappingsComponent_QueryAPI extends WebpageMappingsComponent {
  import WebpageMappingsComponent._

  // GET:
  def findWebpageBy_HostnameAndPathName(hostName: String, pathName: String) =
    webpageMappingT.filter(a => a.hostName === hostName && a.pathName === pathName)

  def findWebpagesBy_Hostname(hostName: String) =
    webpageMappingT.filter(_.hostName === hostName)

  def findWebpageBy_WebpageLoggingId(webpageLoggingId: Long) =
    webpageMappingT.filter(_.id === webpageLoggingId)
}
