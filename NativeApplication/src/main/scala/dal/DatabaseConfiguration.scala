package dal

import dal.controllers.browsingData.DailyWebpageVisits_DAL_SyncSystem
import h2.autoCollector.{AutoAnnotatorCollectionComponent, HostnameAutoAnnotatorsComponent}
import h2.browsingData.DailyWebpageVisitsComponent
import org.slf4j.{Logger, LoggerFactory}

object DatabaseConfiguration{
  import slick.jdbc.H2Profile.api.Database

  val db = Database.forConfig("applicationDatabase")

  def generateAllUserSystemTables(): Unit = {
    import h2.webpageData._
    import h2.browsingData

    new BookmarksMappingsComponent
      with WebpageMappingsComponent
      with WebpageSearchDataComponent
      with WebpageTagsMappingsComponent
      with DailyWebpageVisitsComponent
      with AutoAnnotatorCollectionComponent
      with HostnameAutoAnnotatorsComponent{

      import slick.jdbc.H2Profile.api._

      val logger: Logger = LoggerFactory.getLogger("generateAllUserSystemTables")


      def setup: Unit = {
        try {
          db.run({
            (
              dailyWebpageVisitsT.schema
                ++
                bookmarkMappingT.schema
                ++
                webpageMappingT.schema
                ++
                webpageSearchDataT.schema
                ++
                webpageTagsMappingT.schema
                ++
                hostnameAutoAnnotatorT.schema
                ++
                autoAnnotatorT.schema


              ).createIfNotExists
          }.transactionally)

          DailyWebpageVisits_DAL_SyncSystem(db)

//          logger.info("Daily webpage visits is done loading")
        }
      }

    }.setup
  }
}
