
import browserAdapter.BrowserInputController
import dal.DatabaseConfiguration
import java.lang.Thread.sleep

import dal.controllers.autoCollector.AutoAnnotator_DAO
import dal.controllers.browsingData.DailyWebpageVisits_DAO
import dal.controllers.webpageData.{BookmarksMappings_DAO, WebpageMappings_DAO, WebpageSearchData_DAO, WebpageTagMappings_DAO}
import org.slf4j.LoggerFactory
import session.BrowserSessionData

object LocalApplication{

  val logger = LoggerFactory.getLogger("LocalApplication")

  def main(args: Array[String]): Unit = {

    logger.info("started: ")
    val instance = SetUp()
    stayConnected(instance)
    cleanUp(instance)
    logger.info("ending...")
    sleep(1000)

    logger.info("ended!!!")

  }


  def SetUp(): BrowserInputController = {
    DatabaseConfiguration.generateAllUserSystemTables()

    val webpageMappings_DAL = new WebpageMappings_DAO(DatabaseConfiguration.db)
    val webpageSearchData_DAL = new WebpageSearchData_DAO(DatabaseConfiguration.db)
    val bookmarksMappings_DAL = new BookmarksMappings_DAO(DatabaseConfiguration.db)
    val webpageTagMappings_DAL = new WebpageTagMappings_DAO(DatabaseConfiguration.db)
    val dailyWebpageVisits_DAL = new DailyWebpageVisits_DAO(DatabaseConfiguration.db)
    val autoCollector_DAL = new AutoAnnotator_DAO(DatabaseConfiguration.db)

    val browserSessionData = BrowserSessionData()

    val instance = BrowserInputController(browserSessionData,
                                          webpageMappings_DAL,
                                          webpageSearchData_DAL,
                                          bookmarksMappings_DAL,
                                          webpageTagMappings_DAL,
                                          dailyWebpageVisits_DAL,
                                          autoCollector_DAL)
    instance.connectToBrowserPlugin()


    instance
  }

  def stayConnected(instance:BrowserInputController): Unit = {
    instance.connectToBrowserPlugin()
  }

  def cleanUp(instance:BrowserInputController):Unit = {
//    IndexerBM25.instance.cleanUp()
    instance.cleanUp()
  }

}
