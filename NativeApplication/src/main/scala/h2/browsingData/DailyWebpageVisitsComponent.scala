package h2.browsingData


import java.nio.ByteBuffer
import slick.jdbc.H2Profile.api._

import java.sql.Date
import java.time.LocalDate

object DailyWebpageVisitsComponent{
  case class DailyWebpageVisits(date:LocalDate,webpageLoggingIds:Set[Long])
}

trait DailyWebpageVisitsComponent {
  import DailyWebpageVisitsComponent._

  /**
   * Change Set[Long] to Array[Byte] for db tables
   * @return
   */
  implicit def SerializedType = MappedColumnType.base[Set[Long], Array[Byte]](
    { theSet => {
      val x: Array[Byte] = theSet.toArray.flatMap(theLong => {
        ByteBuffer.allocate(8).putLong(theLong).array()
      }).toArray
      x
    }
    },
    { theBytes => {
      val bytes = ByteBuffer.wrap(theBytes)
      val theWebPageIds: Array[Long] = Array.ofDim[Long](bytes.limit() / 8)
      for (i <- theWebPageIds.indices) {
        theWebPageIds(i) = bytes.getLong()
      }

      theWebPageIds.toSet
    }
    })

  /**
   * Change LocalDate to sql.Date for db tables
   * @return
   */
  implicit def localDateToDate = MappedColumnType.base[LocalDate, Date](
    localDate => Date.valueOf(localDate),
    date => date.toLocalDate
  )

  lazy val dailyWebpageVisitsT = TableQuery[DailyWebpageVisits_Table]

  class DailyWebpageVisits_Table(tag:Tag) extends Table[DailyWebpageVisits](tag,"DailyWebpageVisits") {

    val date = column[LocalDate]("date",O.Unique)
    val webpageLoggingIds = column[Set[Long]]("webpageIdsVisited")

    override def * = (date,webpageLoggingIds) <> (DailyWebpageVisits.tupled, DailyWebpageVisits.unapply)
  }
}
