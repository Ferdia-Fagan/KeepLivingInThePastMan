package h2.webpageData

import slick.jdbc.H2Profile.api._

trait WebpageTagsMappingsComponent extends WebpageMappingsComponent {
  import WebpageTagsMappingsComponent._

  lazy val webpageTagsMappingT = TableQuery[WebpageTagsMappings_Table]

  class WebpageTagsMappings_Table(tag: Tag) extends Table[WebpageTag](tag,"WebpagesTags"){

    val tagId = column[Int]("tagId")  // todo: make primary key
    val webpageLoggingId = column[Long]("webpageLoggingId")

    override def * = (tagId,webpageLoggingId).mapTo[WebpageTag]
  }

}

object WebpageTagsMappingsComponent {
  case class WebpageTag(tagId: Int, webpageLoggingId: Long)
}



