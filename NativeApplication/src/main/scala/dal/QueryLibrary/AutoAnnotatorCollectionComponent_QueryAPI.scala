package dal.QueryLibrary

import slick.jdbc.H2Profile.api._

import h2.autoCollector.{AutoAnnotatorCollectionComponent, HostnameAutoAnnotatorsComponent}

trait AutoAnnotatorCollectionComponent_QueryAPI extends AutoAnnotatorCollectionComponent{

  import AutoAnnotatorCollectionComponent._

  // Create

  def addNewAutoAnnotators(newAutoAnnotators: Array[AutoAnnotator]) =
    autoAnnotatorT ++= newAutoAnnotators

  // Get:
  def getAutoAnnotatorBy_Id(autoAnnotatorId: Int) =
    autoAnnotatorT.filter(_.autoAnnotatorId === autoAnnotatorId)

  def getAutoAnnotatorIdsBy_TagIds(tagIds: Array[Int])=
    autoAnnotatorT.filter(_.tagId inSet(tagIds))

}
