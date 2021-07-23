package h2.autoCollector

import slick.jdbc.H2Profile.api._

import java.nio.ByteBuffer

/**
 * Used to store autoCollectors.
 */
trait AutoAnnotatorCollectionComponent extends HostnameAutoAnnotatorsComponent {
  import AutoAnnotatorCollectionComponent._

  lazy val autoAnnotatorT = TableQuery[AutoAnnotatorTable]

  class AutoAnnotatorTable(tag: Tag) extends Table[AutoAnnotator](tag, "AutoAnnotatorCollection") {

    val autoAnnotatorId = column[Int]("id")

    val tagId = column[Int]("tagId")

    override def * = (autoAnnotatorId,tagId).mapTo[AutoAnnotator]
  }
}

object AutoAnnotatorCollectionComponent {
  case class AutoAnnotator(autoCollectorId:Int, tagIds: Int)
}
