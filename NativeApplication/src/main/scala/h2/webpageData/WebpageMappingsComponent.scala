package h2.webpageData

import slick.jdbc.H2Profile.api._

trait WebpageMappingsComponent{
  import WebpageMappingsComponent._

  lazy val webpageMappingT = TableQuery[WebpageMapping_Table]

  class WebpageMapping_Table(tag: Tag) extends Table[Webpage](tag, "WebpageMapping") {

    val id = column[Long]("id", O.PrimaryKey, O.AutoInc)

    val hostName  = column[String]("hostName")
    val pathName = column[String]("pathName")

    val isIndexed = column[Boolean]("isIndexed")

    val isTagged = column[Boolean]("isTagged")
    val hostnameId = column[Option[Int]]("hostnameId")

    def * = (id.?, hostName, pathName, isIndexed,isTagged,hostnameId) <> (Webpage.tupled, Webpage.unapply)

    def uniqueWebPage = index("web_page", (hostName, pathName), unique = true)

  }
}

object WebpageMappingsComponent{
  case class Webpage(id:Option[Long], hostName:String, pathName:String, isIndexed:Boolean = false, isTagged:Boolean = false, hostnameId: Option[Int] = None){
    def getTheId():Long={
      id match {
        case Some(value) => return value
        case None => return -1
      }
    }
  }
}


