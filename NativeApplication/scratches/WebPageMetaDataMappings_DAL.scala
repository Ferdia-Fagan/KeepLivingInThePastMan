//package dal.controllers.webpageData
//
//import org.slf4j.Logger
//import org.slf4j.LoggerFactory
////import grizzled.slf4j.Logger
//import slick.jdbc.H2Profile.api._
//import slick.lifted.TableQuery
//import h2.webpageData.{Webpage, WebPageMetaData, WebPageMetaData_Table}
//
//import
//import scala.concurrent.Future
//import scala.util.{Failure, Success}
//
//trait WebPageMetaDataMappings_DAL_Interface extends DatabaseConfig {
//  // Create
//  def createMetaDataForPage(webPageMetaData:WebPageMetaData): Unit
//
//  // update
//  def updateMetaDataForPage(webPageId: Long, updateWPMD: Array[(String,AnyVal)]): Unit
//
//
//  // fetch:
//
//  def findAll(): Future[Seq[WebPageMetaData]]
//
//  def getPageMetaDataById(id:Long): Future[Option[WebPageMetaData]]
//}
//
//class WebPageMetaDataMappings_DAL() extends WebPageMetaDataMappings_DAL_Interface {
//  val logger = LoggerFactory.getLogger(classOf[WebPageMetaDataMappings_DAL])
//
//  val webPageMetaData_Table: TableQuery[WebPageMetaData_Table] = TableQuery[WebPageMetaData_Table]
//
//  try{
//    val setupAction: DBIO[Unit] = DBIO.seq(
//      // Create the schema by combining the DDLs for the Suppliers and Coffees
//      // tables using the query interfaces
//      (webPageMetaData_Table.schema).create
//
//    )
//
//    db.run(setupAction)
//    //    println("all setup")
//  }
//
//  override def createMetaDataForPage(webPageMetaData: WebPageMetaData): Unit = {
//
//    val insertAction = webPageMetaData_Table += webPageMetaData
////    val insertAction = webPageMetaData_Table.map(_) += webPageMetaData
//    db.run(insertAction)
//  }
//
//  override def getPageMetaDataById(id: Long): Future[Option[WebPageMetaData]] = {
//    val q = webPageMetaData_Table.filter(_.id === id).result.headOption
////    webPageMetaData_Table.findBy(_.id === id)
//    //    db.run(webPageMappings.result)
//    db.run(q)
//  }
//
//  override def findAll(): Future[Seq[WebPageMetaData]] = {
//    db.run(webPageMetaData_Table.result)
//  }
//
//  def update(webPageId: Long): DBIO[Int] ={
//    sqlu"""update WEBPAGEMETADATA SET visitCount=10 where id=${webPageId}"""
//  }
//
//  override def updateMetaDataForPage(webPageId: Long, updateWPMD: Array[(String,AnyVal)]): Unit = {
////    val (params,values) = updateWPMD.unzip
//    val updatePart = updateWPMD.map{
//      case (param,updatedValue) => {
//        s"$param = '$updatedValue'"
//      }
//    }.mkString(",")
////    println("updatePart " + updatePart)
////
////    val theQuery = "UPDATE WebPageMetaData SET " + updatePart
////
////    println("theQuery : " + theQuery)
////    println("x : " + updatePart)
////    val q = sqlu"""update WebPageMetaData SET visitCount=10 where id=1"""
////    println("the query is : " + q.statements)
//
////    val q = update(1L)
//    val q = sqlu"""update WebPageMetaData SET #$updatePart where id=${webPageId}"""
//
////    println("the query is : " + q.statements)
//
////    db.run(q)
//    val x = db.run(q)
//    x.onComplete {
//      case Success(posts) => logger.info("finnished here")
//      case Failure(t) => logger.info("An error has occurred: " + t)
//    }
////    webPageMetaData_Table.filter(_.id === webPageId).map(a=> (a.visitCount,a.totalVisitTime)).update(1,2)
////    tsql"UPDATE WebPageMetaData SET  where id = $webPageId"
//  }
//}
