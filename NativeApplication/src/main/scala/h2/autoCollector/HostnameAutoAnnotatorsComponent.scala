package h2.autoCollector

import h2.webpageData.WebpageMappingsComponent
import slick.jdbc.H2Profile.api._

/**
 * Used to store mappings from hostname to autoCollectorId
 */
trait HostnameAutoAnnotatorsComponent {
  import HostnameAutoAnnotatorsComponent._

  lazy val hostnameAutoAnnotatorT = TableQuery[HostnameAutoAnnotatorTable]

  class HostnameAutoAnnotatorTable(tag: Tag) extends Table[HostnameAutoAnnotatorMapping](tag, "HostnameAutoAnnotatorCollection") {

    val hostnameId = column[Int]("hostnameId")
    val autoAnnotatorId = column[Int]("autoAnnotatorId")

    override def * = (hostnameId,autoAnnotatorId).mapTo[HostnameAutoAnnotatorMapping]

  }
}

object HostnameAutoAnnotatorsComponent{
  case class HostnameAutoAnnotatorMapping(hostname:Int, autoCollectorId:Int)
}
