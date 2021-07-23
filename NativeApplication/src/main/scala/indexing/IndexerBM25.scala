package indexing

import org.slf4j.LoggerFactory

import java.io._
import java.nio.file.{Files, Paths}
//import java.io.{FileInputStream, FileOutputStream, ObjectInputStream, ObjectOutputStream}
//import java.nio.file.{Files, Paths}
import scala.collection.immutable.HashSet
import scala.collection.mutable

/**
 * Used by sync system controller.
 */
trait Index_Management{
  def indexDocument(docId:Long, docText: String): Unit
  def updateIdf(): Unit
  def cleanUp(): Unit
}

/**
 * Used by query controller.
 */
trait Index_Queryer{
  def query(webpageLoggingIds: Option[Set[Long]], query: String): Array[Long]
  def isIndexEmpty():Boolean // TODO: refactor hack for beta
}

/**
 * Indexer.
 * enables:
 * 1) Indexing new documents.
 * 2) Managing the index
 * 3) Querying the index
 *
 */
class IndexerBM25 extends Index_Management with Index_Queryer {

  val logger = LoggerFactory.getLogger("IndexerBM25")

  val STOP_WORDS: HashSet[String] = HashSet("a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is",
    "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there",
    "these", "they", "this", "to", "was", "will", "with")


  var index: IndexMap = IndexMap()

  def cleanUp(): Unit = {
    index.cleanUp();
  }

  def isIndexEmpty():Boolean = index.isEmpty

  override def indexDocument(webpageLoggingId:Long, docText: String): Unit = {

    val reducedDocText = sanatizeTextAndRemoveStopwords(docText)

    val docAsBagOfWords = bagOfWordsTheDoc(reducedDocText)

    index.appendDocumentsBagOfWords(webpageLoggingId,docAsBagOfWords,reducedDocText.length)

    this.updateIdf()
  }

  /**
   *
   * @param filteredDocText -> Stopwords and punctuation have been removed
   * @return
   */
  def bagOfWordsTheDoc(filteredDocText:Array[String]):Map[String,Int] = {
        filteredDocText.groupMapReduce(_.toLowerCase())(_ => 1)(_ + _)  // TODO: not sure which is faster, although this way is quite optimized
  }

  def sanatizeTextAndRemoveStopwords(text: String): Array[String] = {
    text.replaceAll("""[\p{Punct}]""", "").replaceAll("\\s+", " ").split(' ')
      .filterNot(term => STOP_WORDS.contains(term))
  }

  override def updateIdf():Unit ={
    index.updateIdf()
  }

  override def query(webpageLoggingIdsToFilterBy: Option[Set[Long]], query: String): Array[Long] = {
    val querysUniqueKeyWords = sanatizeTextAndRemoveStopwords(query).distinct

    val relevantPartsOfIndex = index.getQueryTermsIndexMapResults(webpageLoggingIdsToFilterBy,querysUniqueKeyWords)
    relevantPartsOfIndex
  }
}

object IndexerBM25 {

  val instance: IndexerBM25 = new IndexerBM25()

  def apply() = instance

}
