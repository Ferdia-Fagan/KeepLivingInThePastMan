package h2.webpageData

import slick.jdbc.H2Profile.api._

trait WebpageSearchDataComponent {
  import WebpageSearchDataComponent._

  lazy val webpageSearchDataT = TableQuery[WebpageSearchData_Table]

  class WebpageSearchData_Table(tag:Tag) extends Table[WebpageSearchData](tag,"WebpageSearchData") {

    val webpageLoggingId = column[Long]("webpageLoggingId",O.Unique)

    val title = column[String]("title")

    val url = column[String]("url")
    val imgUrl = column[String]("imgUrl")

    override def * =
      (webpageLoggingId, title, url, imgUrl) <> (WebpageSearchData.tupled, WebpageSearchData.unapply)
  }
}

object WebpageSearchDataComponent {
  case class WebpageSearchData(webpageLoggingId: Long, title: String, url: String,
                               imgUrl: String)
}
