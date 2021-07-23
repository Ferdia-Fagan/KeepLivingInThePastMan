package dal.indexing

import slick.jdbc.H2Profile.api._
import h2.indexing.{IndexMappingWebDocumentComponent, IndexMappingsComponent}
import indexing.TermIndexMap
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Success

class IndexMappings_DAO extends IndexMappingsComponent with IndexMappingWebDocumentComponent {

  import dal.DatabaseConfiguration.db

  val logger = LoggerFactory.getLogger(classOf[IndexMappings_DAO])

  try{
    db.run({
      (indexT.schema ++ webpageIndexDataT.schema).createIfNotExists
    }.transactionally)
  }

  def addDocumentToIndexData(webpageLoggingId:Long, documentLength: Int): Unit = {
    val addingDocumentReq = webpageIndexDataT += WebpageIndexData(webpageLoggingId, documentLength)
    db.run(addingDocumentReq)
  }

//  def addTermToIndex(term: String,totalTermCount: Int, numberOfDocsContainingTerm: Int, idfValue: Double,
//                              termDocumentFrequencyMap: mutable.HashMap[Long, Int]): Unit = {
//    val addingNewTermReq = indexT += TermIndex(None, term,totalTermCount, numberOfDocsContainingTerm, idfValue,
//      termDocumentFrequencyMap)
//    db.run(addingNewTermReq)
//  }

  /**
   * This is wrapped in future so as to wait while saving index.
   * This is so can cleanUp the index and save for future sessions
   * TODO: refactor
   * @param termsToAdd
   * @return
   */
  def addTerms(termsToAdd: Array[TermIndexMap]): Future[Unit] = Future {
    val newTermsToAdd = termsToAdd.map(termToAdd => TermIndex(None, termToAdd.term,termToAdd.totalTermCount,
      termToAdd.numberOfDocsContainingTerm, termToAdd.idfValue,
      termToAdd.termDocumentFrequencyMap))

    val addTermsReq = indexT ++= newTermsToAdd

    Await.result(db.run(addTermsReq),Duration.Inf)
  }

  /**
   * This is wrapped in future so as to wait while saving index.
   * This is so can cleanUp the index and save for future sessions
   * TODO: refactor
   * @param termsToUpdate
   * @return
   */
  def updateTerms(termsToUpdate: Array[TermIndexMap]): Future[Unit] = Future{

    val theTermsToUpdate = termsToUpdate.map(termToAdd => TermIndex(termToAdd.termId, termToAdd.term, termToAdd.totalTermCount,
      termToAdd.numberOfDocsContainingTerm, termToAdd.idfValue,
      termToAdd.termDocumentFrequencyMap)).toSeq


    val updateReqs = DBIO.sequence(theTermsToUpdate.map(termToUpdate => {
                  indexT.filter(_.id === termToUpdate.id).update(
                    termToUpdate)
                }))

    Await.result(db.run(updateReqs),Duration.Inf)
//    logger.info("finished updateing terms to index")
  }

  def getAllIndex(): Future[Seq[TermIndex]] = {
    db.run(indexT.result)
  }

  def getAllWebpageIndexData(): Future[Seq[WebpageIndexData]] = {
    db.run(webpageIndexDataT.result)
  }
}
