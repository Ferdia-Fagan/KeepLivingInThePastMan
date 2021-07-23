package h2.indexing

import slick.jdbc.H2Profile.api._

import java.io.{ByteArrayOutputStream, ObjectInputStream, ObjectOutputStream}
import java.sql.Blob
import javax.sql.rowset.serial.SerialBlob
import scala.collection.mutable

trait IndexMappingsComponent extends IndexMappingWebDocumentComponent {

  import h2.utils.Serialized._

  case class TermIndex(id: Option[Long],term: String, totalTermCount: Int, numberOfDocsContainingTerm: Int,
                       idfValue: Double, termDocumentFrequencyMap: Serialized[mutable.HashMap[Long,Int]])
  
  def TermIndex(id: Option[Long],term: String, totalTermCount: Int, numberOfDocsContainingTerm: Int,
                idfValue: Double, termDocumentFrequencyMap: mutable.HashMap[Long,Int]): TermIndex
                    = TermIndex(id,term, totalTermCount, numberOfDocsContainingTerm,
                                idfValue, Serialized(termDocumentFrequencyMap))

  class IndexMappings_Table(tag:Tag) extends Table[TermIndex](tag,"Index") {

    val id = column[Long]("id",O.PrimaryKey, O.AutoInc)

    val term = column[String]("term", O.Unique)

    val totalTermCount = column[Int]("totalTermCount")
    val numberOfDocsContainingTerm = column[Int]("numberOfDocsContainingTerm")
    val idfValue = column[Double]("idfValue")

    val termDocumentFrequencyMap = column[Serialized[mutable.HashMap[Long,Int]]]("termDocumentFrequencyMap")

    override def * = (id.?,term,totalTermCount,numberOfDocsContainingTerm,idfValue,
    termDocumentFrequencyMap) <> (TermIndex.tupled, TermIndex.unapply)
  }

  lazy val indexT = TableQuery[IndexMappings_Table]
}


