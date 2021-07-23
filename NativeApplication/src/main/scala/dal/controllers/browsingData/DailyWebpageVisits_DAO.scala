package dal.controllers.browsingData

import slick.jdbc.H2Profile.api._
import org.slf4j.{Logger, LoggerFactory}

import java.time.LocalDate
import scala.concurrent.Future
import h2.browsingData.DailyWebpageVisitsComponent

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

//trait DailyWebpageVisits_DAL_SyncSystemAPI {
//  val db:Database
//
//  def addDailyWebpageVisits(todaysDate: LocalDate, webpagesVisited: Long): Unit
//  def addWebpagesVisitedDuringDate(date: LocalDate, webpagesVisited: Set[Long]): Unit
//}
//
trait DailyWebpageVisits_DAO_QueryAPI {
  def getWebpagesVisitedOnDates(dates: List[LocalDate]): Future[Seq[Set[Long]]]
}

class DailyWebpageVisits_DAO(val db:Database) extends DailyWebpageVisitsComponent
                                              with DailyWebpageVisits_DAO_QueryAPI {
  import DailyWebpageVisitsComponent.DailyWebpageVisits

  val logger: Logger = LoggerFactory.getLogger(classOf[DailyWebpageVisits_DAO])

  def addWebpagesVisitedDuringDate(date: LocalDate, webpagesVisited: Set[Long]): Unit = {
    val addWebpageVisitedFoDate_Req = dailyWebpageVisitsT += DailyWebpageVisits(date,webpagesVisited)

    db.run(addWebpageVisitedFoDate_Req)
  }

  def getWebpagesVisitedOnDate(date: LocalDate): Future[Seq[Set[Long]]] = {
    val webpageVisitsForDate_Req = dailyWebpageVisitsT.filter(_.date === date).map(_.webpageLoggingIds).take(1)

    db.run(webpageVisitsForDate_Req.result)
  }

  def getWebpagesVisitedOnDates(dates: List[LocalDate]): Future[Seq[Set[Long]]] = {
    val webpagesVisitsForDates_Req = dailyWebpageVisitsT.filter(_.date inSet dates).map(_.webpageLoggingIds).distinct

    db.run(webpagesVisitsForDates_Req.result)
  }
}

object DailyWebpageVisits_DAL_SyncSystem{
  private var instance: DailyWebpageVisits_DAO = null

  def apply(db:Database): DailyWebpageVisits_DAO = {
    if(instance == null){
      instance = new DailyWebpageVisits_DAO(db)
    }
    instance
  }

  def getInstance: DailyWebpageVisits_DAO = {
    instance
  }

}