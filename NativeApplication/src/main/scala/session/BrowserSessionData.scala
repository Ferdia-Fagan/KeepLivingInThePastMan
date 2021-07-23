package session

import browserAdapter.controllers.QueryController
import dal.controllers.browsingData.DailyWebpageVisits_DAL_SyncSystem
import org.slf4j.{Logger, LoggerFactory}

import java.io.{FileInputStream, FileOutputStream, ObjectInputStream, ObjectOutputStream}
import java.nio.file.{Files, Paths}
import scala.collection.mutable

/**
 * Will contain the local session data.
 *
 * Such as:
 * (1) Set of webpages the user has opened during the day. -> {@link BrowserSessionData#webpagesOpenedToday}
 * (2) Other session data for future features. Such as tracking which webpages (webpageLoggingIds) are opened currently,
 *     which tabs are opened, resent webpages opened, etc. So can reduce the index from these associations.
 *     This is for future features
 */
class BrowserSessionData(val webpagesOpenedToday: mutable.Set[Long]) {
  import BrowserSessionData._
  val logger: Logger = LoggerFactory.getLogger(classOf[QueryController])

  def cleanUp(): Unit = {

    val path = "./TemporaryData/todaysTemporaryData"

//    val yesterdaysDate  = java.time.LocalDate.now.minusDays(1)
//    logger.info("yesterdaysDate for browserData: " + yesterdaysDate)
//    logger.info("yesterdaysDate for browserData webpages: " + webpagesOpenedToday.mkString(", "))

    val todaysTemporaryData = (java.time.LocalDate.now,webpagesOpenedToday) // LOGGING TODAYS TEMPORARY DATA

    val out = new ObjectOutputStream(new FileOutputStream(path))
    out.writeObject(todaysTemporaryData)
    out.close()
  }


}

object BrowserSessionData{
  val logger: Logger = LoggerFactory.getLogger("BrowserSessionData Companion object")

  def apply(): BrowserSessionData = {

    val path = "./TemporaryData/todaysTemporaryData"

    val webpagesOpenedToday = {
     if(Files.exists(Paths.get(path))){
       val in = new ObjectInputStream(new FileInputStream(path))
       val (temporaryDataDate,retrievedWebpagesOpenedToday) = in.readObject().asInstanceOf[(java.time.LocalDate,mutable.Set[Long])]
       in.close()

       if(temporaryDataDate.equals(java.time.LocalDate.now)){
         retrievedWebpagesOpenedToday
       }else {
         // Then this is yesterdays temporary data
//         logger.info("yesterdays temporary date. : " + temporaryDataDate)
//         logger.info("yesterdays temporary data. : " + retrievedWebpagesOpenedToday.mkString(", "))
         DailyWebpageVisits_DAL_SyncSystem.getInstance.addWebpagesVisitedDuringDate(temporaryDataDate,Set.empty ++ retrievedWebpagesOpenedToday)

         mutable.Set[Long]()
       }
     }else {
       mutable.Set[Long]()
     }
    }
//    logger.info("todays loaded webpage visits diary webpageIds: " + webpagesOpenedToday.mkString(", "))

    new BrowserSessionData(webpagesOpenedToday)
  }

}


