package indexing

import dal.indexing.IndexMappings_DAO
import h2.indexing.IndexMappingsComponent
import org.slf4j.LoggerFactory

import java.io.{FileInputStream, FileOutputStream, ObjectInputStream, ObjectOutputStream, Serializable}
import scala.collection.mutable
import scala.concurrent.{Await, CanAwait, Future}
import scala.concurrent.duration.Duration
import java.nio.file.{Files, Paths}

import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Custom hashmap:
 * <term, (totalTermCount, <docId, count>)>
 *
 *   Used to
 */
class IndexMap(val webpageLengths: mutable.HashMap[Long,Int],
               val index_DAL: IndexMappings_DAO,
               var totalAmountOfDocuments: Int, var totalDocumentsLength: Long,
               var avgDocumentLength: Long) extends mutable.HashMap[String, TermIndexMap] { self =>

  import IndexMap._

  def this(indexMap: mutable.HashMap[String, TermIndexMap], webpageLengths: mutable.HashMap[Long,Int],
           index_DAL: IndexMappings_DAO,
           totalAmountOfDocuments: Int, totalDocumentsLength: Long, avgDocumentLength: Long) = {
    this(webpageLengths, index_DAL, totalAmountOfDocuments, totalDocumentsLength, avgDocumentLength)
    this ++= indexMap
  }

  val logger = LoggerFactory.getLogger(classOf[IndexMap])

//  logger.info("indexMap: " + this.mkString(","))
//  logger.info("webpageLengths: " + webpageLengths.mkString(","))

  /**
   * Saves index to database.
   * Saves index variables
   * (totalAmountOfDocuments,totalDocumentsLength,avgDocumentLength)
   * to local file (for future sessions).
   */
  def cleanUp(): Unit ={
//    logger.info("cleaning up index:")

    // Save variables to an object
    val res = (totalAmountOfDocuments,totalDocumentsLength,avgDocumentLength)
    val path = "./index/index"
    val out = new ObjectOutputStream(new FileOutputStream(path))
    out.writeObject(res)
    out.close()

    // UPDATE IDF TODO: this is temporary
    this.updateIdf()

    // Save updated index db:
//    logger.info("about to save results")
    val (newTermsToAdd, termsToUpdate) = this.values.filter(_.hasBeenUpdated).partition(_.termId.isEmpty)

    val updateIndex = for {
      _ <- index_DAL.addTerms(newTermsToAdd.toArray)
      _ <- index_DAL.updateTerms(termsToUpdate.toArray)
    } yield()

    Await.result(updateIndex,Duration.Inf)
//    logger.info("done saving index")
  }

  def appendDocumentsBagOfWords(docId: Long, docAsBagOfWords: Map[String,Int], docLength:Int): Unit ={
    totalAmountOfDocuments += 1

    webpageLengths.put(docId,docLength)
    index_DAL.addDocumentToIndexData(docId,docLength)

    totalDocumentsLength += docLength


    docAsBagOfWords.foreach{case (term,termCountInDoc)=> {
      this.get(term) match{
        case Some(termIndexMap) => {
          termIndexMap.addTermCount(termCountInDoc, docId)
        }
        case None => {
          this += (term -> new TermIndexMap(None,term,termCountInDoc,mutable.HashMap[Long,Int](docId -> termCountInDoc),true))
        }
      }
    }}
  }

  def updateIdf(): Unit = {
    IndexMap.TotalAmountOfDocuments = totalAmountOfDocuments

    avgDocumentLength = (totalDocumentsLength/totalAmountOfDocuments)

    this.foreach{case (_,termIndexMap) =>{
      termIndexMap.updateIdfForTerm()
    }}
  }

  /**
   * get relevant documents and their score from unique set of keywords
   * @param queryUniqueKeyWords
   * @return Array[(DocumentId,Score)]
   */
  def getQueryTermsIndexMapResults(filteredWebpageLoggingIds: Option[Set[Long]], queryUniqueKeyWords: Array[String]): Array[Long] = {  // TODO: REFACTOR
    // TODO: clean up as is logically sound now
    // TODO: Turn this into a priority queue so as to save space.
    // https://stackoverflow.com/questions/5674741/simplest-way-to-get-the-top-n-elements-of-a-scala-iterable

    val queryDocumentRanks = queryUniqueKeyWords.map(keyWord =>
      this.get(keyWord) match {
        case Some(keyWordToDocumentsIndexMap) => {
          val keyWordIdfValue = keyWordToDocumentsIndexMap.idfValue

          val documentsWithTermScores = (filteredWebpageLoggingIds match {
            case Some(webpageLoggingIdsFilter) => // Then filter web pages
//              logger.info("webpage filter applied to query : " + webpageLoggingIdsFilter.mkString(","))
              // Filter the termDocumentFrequencyMap by webpageFilters
              webpageLoggingIdsFilter.filter(keyWordToDocumentsIndexMap.termDocumentFrequencyMap.contains(_))
                .map(filteredWebpageLoggingId =>
                  (filteredWebpageLoggingId -> keyWordToDocumentsIndexMap.termDocumentFrequencyMap(filteredWebpageLoggingId))
                )

            case None => {
//              logger.info("no webpage filter applied to query")
              keyWordToDocumentsIndexMap.termDocumentFrequencyMap
            }  // Then searching all web pages
          }).map{case (documentId,termDocFrequency) => {
            //           documentId -> score
            (documentId,
              calculateScoreForTermAndItsDocuments(keyWordIdfValue, termDocFrequency, webpageLengths(documentId)))
          }}
          documentsWithTermScores
        }
        case None => {
          // Then do not have any web pages with term
          null
        }
    }).filter(_ != null)

//    logger.info("queryDocumentRanks : " + queryDocumentRanks.mkString(",\n"))

    val ans = queryDocumentRanks.foldLeft(mutable.HashMap[Long,Double]())(
      (docRankings,singleTermAndItsDocRankings) => {
      singleTermAndItsDocRankings.foreach{case(docId,termScore) => {
        if(docRankings contains docId){
          docRankings(docId) += termScore
        }else{
          docRankings.put(docId,termScore)
        }
      }}
      docRankings
    }).toArray

    // TODO:Have to sort the results and prune the results
//    logger.info("the query results (ranked) is: " + ans.mkString(",\n"))

    ans.sortBy(- _._2)
      .map{case (webpageLoggingId,_) => webpageLoggingId}
      .take(QUERY_RESULTS_LIMIT)
  }

  /**
   * This will return the score for the:
   * term and the relevant document
   * @param termIdf
   * @param termFrequencyInDoc
   * @param docLength
   * @return
   */
  def calculateScoreForTermAndItsDocuments(termIdf:Double, termFrequencyInDoc: Int, docLength: Int): Double = {
    termIdf * ( (termFrequencyInDoc * (k + 1) ) /
      ( termFrequencyInDoc + (1 - b + (b * ( docLength/avgDocumentLength ))) ) )
  }




}

object IndexMap {

  var TotalAmountOfDocuments: Int = 0

  val k = 1.2
  val b = 0.75

  val QUERY_RESULTS_LIMIT = 20

  val logger = LoggerFactory.getLogger("IndexMap")

  /**
   * creates IndexMap instance that loads in previous data from database
   * @return IndexMap
   */
  def apply(): IndexMap = {
    val index_DAL = new IndexMappings_DAO()
    val indexRetrieved: Future[mutable.HashMap[String, TermIndexMap]] = index_DAL.getAllIndex().map(_.map(termIndexSave=>
      termIndexSave.term -> new TermIndexMap(termIndexSave.id,termIndexSave.term,
                                              termIndexSave.totalTermCount,termIndexSave.termDocumentFrequencyMap.value,
                                false)

    ).to(mutable.HashMap))

    val webpageLengths = index_DAL.getAllWebpageIndexData().map(_.map(webpageIndexData =>
      webpageIndexData.webpageLoggingId -> webpageIndexData.webpageLength
    ).to(mutable.HashMap))

    val path = "./index/index"

    val (totalAmountOfDocuments,totalDocumentsLength,avgDocumentLength) = if(Files.exists(Paths.get(path))){
      val in = new ObjectInputStream(new FileInputStream(path))
      val indexSaveObject = in.readObject().asInstanceOf[(Int,Long,Long)]
      in.close()
//      logger.info("The saved results are: " + indexSaveObject)
      indexSaveObject
    }else{
//      logger.info("no saved Results. Start new.")
      (0,0L,0L)
    }

    val instance = Await.result(for{
      indexRetrieved <- indexRetrieved
      webpageLengths <- webpageLengths
    } yield(
      new IndexMap(indexRetrieved,webpageLengths,index_DAL,
          totalAmountOfDocuments,totalDocumentsLength,avgDocumentLength)
    ),Duration.Inf)

    if(totalDocumentsLength > 0){
      instance.updateIdf()
    }

    instance
  }
}