package browserAdapter

import protocol.Protocol.MessageIn
import browserAdapter.controllers.{QueryController, SyncSystemController}
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.{DefaultScalaModule, JsonScalaEnumeration, ScalaObjectMapper}
import dal.controllers.autoCollector.AutoAnnotator_DAO
import dal.controllers.browsingData.{DailyWebpageVisits_DAO, DailyWebpageVisits_DAL_SyncSystem}
import dal.controllers.webpageData.{BookmarksMappings_DAO, WebpageMappings_DAO, WebpageSearchData_DAO,
  WebpageTagMappings_DAO}
import indexing.IndexerBM25
import org.slf4j.{Logger, LoggerFactory}
import session.BrowserSessionData

/**
 *  Main input controller.
 *  Handles all messages from browser plugin
 *  and gives them to the respective handlers.
 *  {@link BrowserInputController_API}
 *
 */
class BrowserInputController(val syncSystemController:SyncSystemController,
                             val queryController:QueryController) {
  import session.Utils.MessageMapper

  import browserAdapter.InputOutputAdapter.readInputAsMessage

  // Variables:
  val logger = LoggerFactory.getLogger(classOf[BrowserInputController])

  // Functionality:
  /**
   * Keeps connection with browser plugin and listens for messages.
   * Exits when browser plugin closes.
   */
  def connectToBrowserPlugin():Unit = {
    var requestJson = "";
    while(!requestJson.equals("done")){
      try{

        requestJson = readInputAsMessage(System.in)
      }catch {
        case e=>{

          return
        }
      }
      if(!requestJson.equals("")){
//        val loggingResponseBody: java.io.InputStream =
//          new java.io.ByteArrayInputStream(requestJson.getBytes(java.nio.charset.StandardCharsets.UTF_8.name))

        var messageIn:MessageIn = null;
        try{
          messageIn = MessageMapper.GetMessageFromJsonString[MessageIn](requestJson, classOf[MessageIn])  // TODO: this is a refactor point. PartialFunc
          handleRequest(messageIn);

        }catch{
          case e=> {
            logger.info("error while recieving message")
            logger.error("the errror is: " + e)
            logger.info("the request was : " + requestJson)
          }
        }
        logger.info("done receieve message")

      }
    }
  }

  def handleRequest(message:MessageIn): Unit = {
    message match {
      case MessageIn(messageType,Some(requestResponseId),message) => REQUEST_PROTOCOL(messageType,requestResponseId,message)
      case MessageIn(messageType,None,message) => INPUT_PROTOCOL(messageType,message)
    }
  }

  /**
   * Handle requests (i.e. expect message to be sent back to browser plugin).
   * @param typeOfMessage
   * @param requestResponseId
   * @param requestMessage
   */
  private def REQUEST_PROTOCOL(typeOfMessage: String,
                               requestResponseId: Int,
                               requestMessage: JsonNode): Unit = typeOfMessage match {
    case "Query" => queryController.handle_Query(requestResponseId,requestMessage)

    case "RecordWebPageVisit" => syncSystemController.handle_ReportWebpageVisit(requestResponseId,requestMessage)

  }

  /**
   * Handle input (i.e. browser plugin does not expect response).
   * @param typeOfMessage
   * @param message
   */
  private def INPUT_PROTOCOL(typeOfMessage: String, message: JsonNode): Unit = typeOfMessage match {
    case "SaveWebScrapings" => syncSystemController.handle_WebPageScrapings(message)
    case "UpdateMetaDataReport" => syncSystemController.handle_UpdateReport(message)

    case "AddNewAutoCollector" => syncSystemController.handle_AddNewAutoAnnotator(message)
    case "UpdateAutoCollector" => syncSystemController.handle_UpdateAutoCollector(message)
    case "DeleteAutoCollector" => syncSystemController.handle_DeleteAutoCollector(message)

    case "AddHostnameId" => syncSystemController.handle_AddHostnameId(message)

//    case "testRequest" => handle_TestRequest(message)
  }

//  private def handle_TestRequest(testMessage:JsonNode):Unit = {
//    //    logger.info("handle test request")
//    //    val theData =  mapper.treeToValue(data, classOf[NativeRequest])
//    //    logger.info("the message extracted : " + testMessage)
//
//    //    val response = NativeResponse(requestResponseId,"Hello!")
//    //    logger.info("the message about to send back : " + response)
//    // Send response message back
//    //    val responseJson = mapper.writeValueAsString(response)
//    //    logger.info("the message about to send back : " + responseJson)
//    //    sendMessage(responseJson)
//  }

  def cleanUp(): Unit = {
    syncSystemController.cleanUp()
  }

}


object BrowserInputController{
  /**
   * Create application and link up Controllers
   * @param browserSessionData
   * @param webpageMappings_DAL
   * @param webpageSearchData_DAL
   * @param bookmarksMappings_DAL
   * @param webpageTagMappings_DAL
   * @param dailyWebpageVisits_DAL
   * @param autoCollector_DAL
   * @return
   */
  def apply(browserSessionData: BrowserSessionData,
            webpageMappings_DAL: WebpageMappings_DAO,
            webpageSearchData_DAL: WebpageSearchData_DAO,
            bookmarksMappings_DAL: BookmarksMappings_DAO,
            webpageTagMappings_DAL: WebpageTagMappings_DAO,
            dailyWebpageVisits_DAL: DailyWebpageVisits_DAO,
            autoCollector_DAL: AutoAnnotator_DAO): BrowserInputController = {

    val documentIndex: IndexerBM25 = IndexerBM25()

    val syncSystemController:SyncSystemController = new SyncSystemController(browserSessionData,webpageMappings_DAL,
                                                                              webpageSearchData_DAL,
                                                                              bookmarksMappings_DAL,
                                                                              webpageTagMappings_DAL,
                                                                              dailyWebpageVisits_DAL,
                                                                              autoCollector_DAL,
                                                                              documentIndex)

    val queryController:QueryController = new QueryController(browserSessionData,webpageMappings_DAL,
                                                                                  webpageSearchData_DAL,
                                                                                  bookmarksMappings_DAL,
                                                                                  webpageTagMappings_DAL,
                                                                                  dailyWebpageVisits_DAL,
                                                                                  autoCollector_DAL,
                                                                                  documentIndex)

    new BrowserInputController(syncSystemController,queryController)

  }
}

