package dal.controllers.autoCollector


import dal.QueryLibrary.{AutoAnnotatorCollectionComponent_QueryAPI, HostnameAutoAnnotatorsComponent_QueryAPI}
import h2.autoCollector.{AutoAnnotatorCollectionComponent, HostnameAutoAnnotatorsComponent}
import org.slf4j.LoggerFactory
import slick.jdbc.H2Profile.api._
import protocol.Messages.{NewAutoAnnotor, UpdateAutoAnnotor}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait AutoAnnotator_DAO_QueryAPI {

  def getHostnameIdsFromTagIds(tagIds:Array[Int]): Query[Rep[Int], Int, Seq]
}

class AutoAnnotator_DAO(val db:Database) extends AutoAnnotatorCollectionComponent_QueryAPI
                                                    with HostnameAutoAnnotatorsComponent_QueryAPI
                                                    with AutoAnnotator_DAO_QueryAPI{
  import HostnameAutoAnnotatorsComponent._
  import AutoAnnotatorCollectionComponent._

  private val logger = LoggerFactory.getLogger(classOf[AutoAnnotator_DAO])


  def addNewAutoAnnotator(newAutoCollector:NewAutoAnnotor): Unit ={
    val addNewAutoCollectorAndTags = newAutoCollector.tagIds.map(tagId =>
      AutoAnnotator(newAutoCollector.autoAnnotorId,tagId)
    )

    val addNewAutoCollectorReq = addNewAutoAnnotators(addNewAutoCollectorAndTags)

    db.run(addNewAutoCollectorReq)

    val hostnamesToAddToAutoCollector = newAutoCollector.hostIds.map(hostnameId =>
      HostnameAutoAnnotatorMapping(hostnameId,newAutoCollector.autoAnnotorId)
    )

    val addHostnamesToAutoCollectorReq = addNewHostnameAutoAnnotators(hostnamesToAddToAutoCollector)
    db.run(addHostnamesToAutoCollectorReq)
  }

  def updateAutoAnnotator(updateAutoAnnotator:UpdateAutoAnnotor): Unit = {
    // TODO: refactor this repeated code
    if(updateAutoAnnotator.hostnamesUpdateReport != null){

      if(updateAutoAnnotator.hostnamesUpdateReport.addedTags != null){
        val hostnamesToAddToAutoCollector = updateAutoAnnotator.hostnamesUpdateReport.addedTags.map(
          HostnameAutoAnnotatorMapping(_,updateAutoAnnotator.id)
        )
        val addHostnamesToAutoCollectorReq = hostnameAutoAnnotatorT ++= hostnamesToAddToAutoCollector
        db.run(addHostnamesToAutoCollectorReq)
      }

      if(updateAutoAnnotator.hostnamesUpdateReport.removedTags != null){
        val deleteHostnamesFromAutoCollectorReq = hostnameAutoAnnotatorT.filter(hostnameAutoCollectorPair => {
          (hostnameAutoCollectorPair.autoAnnotatorId === updateAutoAnnotator.id
          &&
          hostnameAutoCollectorPair.hostnameId.inSet(updateAutoAnnotator.hostnamesUpdateReport.removedTags))
        }).delete

        db.run(deleteHostnamesFromAutoCollectorReq)
      }

    }

    if(updateAutoAnnotator.updatedTagsById != null){
      if(updateAutoAnnotator.updatedTagsById.addedTags != null){
        val autoCollectorAddTags = updateAutoAnnotator.updatedTagsById.addedTags.map(tagId =>
          AutoAnnotator(updateAutoAnnotator.id,tagId)
        )
        val addHostnamesToAutoCollectorReq = autoAnnotatorT ++= autoCollectorAddTags
        db.run(addHostnamesToAutoCollectorReq)
      }

      if(updateAutoAnnotator.updatedTagsById.removedTags != null){
        val autoCollectorDeleteTagsReq = autoAnnotatorT.filter(autoCollectorIdAndTagPair => {
          (autoCollectorIdAndTagPair.autoAnnotatorId === updateAutoAnnotator.id
            &&
            autoCollectorIdAndTagPair.tagId.inSet(updateAutoAnnotator.updatedTagsById.removedTags))
        }).delete

        db.run(autoCollectorDeleteTagsReq)
      }
    }

  }

  def deleteAutoAnnotator(autoAnnotatorId: Int): Unit = {
    val deleteAutoCollectorById_Req = getAutoAnnotatorBy_Id(autoAnnotatorId).delete
    db.run(deleteAutoCollectorById_Req)

    val deleteHostnameAutoCollectorMapping_Req = getAutoAnnotatorHostnamesById(autoAnnotatorId).delete
    db.run(deleteHostnameAutoCollectorMapping_Req)
  }



  /**
   *  This will use the tagIds to get autocollectors, which will outer join to get hostIds
   */
  def getHostnameIdsFromTagIds(tagIds:Array[Int]): Query[Rep[Int], Int, Seq] ={

    val getHostIds = for {
      autoCollectorIdsFromTags <- getAutoAnnotatorIdsBy_TagIds(tagIds)
      hostnameId <- hostnameAutoAnnotatorT if autoCollectorIdsFromTags.autoAnnotatorId === hostnameId.hostnameId
    } yield (hostnameId.hostnameId)

    getHostIds
  }


}


