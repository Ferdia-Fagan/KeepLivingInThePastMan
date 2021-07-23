package indexing

import scala.collection.mutable

/**
 * Datastructure for a single term/keyWord.
 *
 * @param totalTermCount -> for the specific term
 * @param termDocumentFrequencyMap -> hashmap to documents and the term frequency for a specific term
 */
class TermIndexMap(val termId:Option[Long] = None,
                   val term:String, var totalTermCount:Int,
                   var termDocumentFrequencyMap: mutable.HashMap[Long,Int],
                   var hasBeenUpdated: Boolean)  {

  var numberOfDocsContainingTerm = 0

  var idfValue: Double = 0

  def getTotalAmountOfDocuments = IndexMap.TotalAmountOfDocuments

  def addTermCount(termCount: Int, docId: Long): Unit={
    numberOfDocsContainingTerm+=1
    hasBeenUpdated = true

    totalTermCount += termCount
    termDocumentFrequencyMap += (docId -> termCount)
  }

  def updateIdfForTerm(): Unit = {
    idfValue = Math.log(
      ((getTotalAmountOfDocuments - numberOfDocsContainingTerm + 0.5)/(numberOfDocsContainingTerm + 0.5))+1
    )
  }



}
