package dal.QueryLibrary

import h2.autoCollector.AutoAnnotatorCollectionComponent.AutoAnnotator
import h2.autoCollector.HostnameAutoAnnotatorsComponent
import slick.jdbc.H2Profile.api._


trait HostnameAutoAnnotatorsComponent_QueryAPI extends HostnameAutoAnnotatorsComponent {

  import HostnameAutoAnnotatorsComponent._

  // CREATE:
  def addNewHostnameAutoAnnotators(newHostnameAutoCollectors: Array[HostnameAutoAnnotatorMapping]) =
    hostnameAutoAnnotatorT ++= newHostnameAutoCollectors


  // GET:
  def getAutoAnnotatorHostnamesById(autoAnnotatorId: Int) =
    hostnameAutoAnnotatorT.filter(_.autoAnnotatorId === autoAnnotatorId)


}
