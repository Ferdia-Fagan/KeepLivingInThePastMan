package h2.indexing

import slick.jdbc.H2Profile.api._

trait IndexMappingWebDocumentComponent{
  case class WebpageIndexData(webpageLoggingId: Long, webpageLength: Int)

  class WebpageIndexData_Table(tag:Tag) extends Table[WebpageIndexData](tag,"WebpageIndexData") {

    val webpageLoggingId = column[Long]("webpageLoggingId")

    val documentLength = column[Int]("documentLength")

    override def * = (webpageLoggingId,documentLength) <> (WebpageIndexData.tupled, WebpageIndexData.unapply)

  }

  lazy val webpageIndexDataT = TableQuery[WebpageIndexData_Table]
}
