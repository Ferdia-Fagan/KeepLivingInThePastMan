import {log_NoneCachedWebpage_Visit} from "../utils/BrowserDataComponent.js"

import {getUpdateReports, getBookmarksIds} from "./BrowserStateManager.js"


/**
 * @description
 * This is used to route responses from native application to their respective handling function.
 * 
 * @summary
 * <requestResponseId, responseHandler()>  
 */
var requestsToRoute = new Map();

var requestResponseId = 0;

var port = browser.runtime.connectNative("keep_living_in_the_past_man");


/**
 * Genericaly used to print the response of a message
 * @param {} response 
 */
function onResponse(response) {

}

/**
 *  Genericly used to print the error response of a message
 * @param {*} error 
 */
function onError(error) {

}



port.onMessage.addListener(handleNativeApplicationMessages);


/**
 * Listen for messages from the native application.
 */  
function handleNativeApplicationMessages(message){

  requestsToRoute.get(message.requestResponseId)(message);  // TODO: UPgrade response to incluyde {requestResponseId,response:message}
};



// Handle all messages to send:

/**
 * Send web page scrapings from browser plugin to the native application.
 * @param {*} webpageLoggingId 
 * @param {*} scrapingsReport : {title: String, url: String, imgUrl: String, scrapedContent: String}
 */
export function sendWebPageScrapings(webpageLoggingId, scrapingsReport){

  // var theScrapingsMessaging = {"type":"SaveWebScrapings", "message":{"webPageId":webPageId,"scrapings":JSON.stringify(transformHTML({html: scrapings}))}};
  // var theScrapingsMessaging = JSON.stringify({"type":"SaveWebScrapings", "message":{"webpageLoggingId":webPageId,"title": scrapingsReport.title, "url": scrapingsReport.url,
  // "imgUrl":scrapingsReport.imgUrl,"scrapings":scrapingsReport.scrapedContent}});
  var theScrapingsMessaging = {type:"SaveWebScrapings", message:{webpageLoggingId:webpageLoggingId,title: scrapingsReport.title, url: scrapingsReport.url,
  imgUrl:scrapingsReport.imgUrl,scrapings:scrapingsReport.scrapedContent}};
  // var theScrapingsMessaging = {"type":"SaveWebScrapings", "message":{"webPageId":webPageId,"scrapings":""}};
  //
  port.postMessage(theScrapingsMessaging);

}

/**
 * This is called when visit a web page and it is not already cached in RelevantPagesDomainsAndPaths.
 * It messages the native application to log the web page visit.
 * 
 * It expects a response using requestsToRoute{} to map the response.
 * @param {*} tabId 
 * @param {*} hostName 
 * @param {*} pathName 
 * @param {*} haveHostAlready 
 */
export function logWebPageVisitToNativeApplication(tabId,hostName, pathName,hostnameId,timeStamp){


  port.postMessage({"type":"RecordWebPageVisit","requestResponseId": requestResponseId,"message":{"hostName":hostName, "pathName":pathName,"hostnameId":hostnameId}});
  
  requestsToRoute.set(requestResponseId++,log_NoneCachedWebpage_Visit.bind(null,tabId,hostName,pathName,timeStamp));
}
// window.logWebPageVisit = logWebPageVisit;

/**
 * @summary
 * This is called to send update report of updated meta data to the native application so as 
 * to then update the native application relevant metadata.
 */
export function sendUpdateReport(){
  //  TODO: this should be made async, or split up so as to (1) get the update report and (2) to send the report.

  let updateReport = getUpdateReports(true)


  port.postMessage({
    // "type": "UpdateMetaDataReport", "updates": wpToBeUpdatedOnApp
    "type": "UpdateMetaDataReport", 
    "message":updateReport
  });

}

/**
 * @description
 * Used to send query to native application.
 * 
 * @param {*} theQuery -> {tags,bookmarks, query}
 */
export function requestQuery(theQuery){


  var queryResultsResolve;
  const queryResultsPromise = new Promise((resolve,reject) =>{
    queryResultsResolve = resolve
  })

  const queryResponseId = requestResponseId++;

  new Promise((resolve,reject) =>{
    if("bookmarks" in theQuery && theQuery.bookmarks.length != 0){
      getBookmarksIds(theQuery.bookmarks).then(bookmarkIds => {
        theQuery.bookmarks = bookmarkIds;

        resolve(theQuery)
      })
    }else{
      resolve(theQuery)
    }
  }).then(theQueryToSend => {
    port.postMessage({
      "type": "Query", 
      "requestResponseId": queryResponseId,
      "message":theQueryToSend
    })
    requestsToRoute.set(queryResponseId,queryResultsResolve.bind(null));
    // return Promise.resolve(a)
  })

  return queryResultsPromise;

}

export function saveNewAutoCollector(newAutoCollector){

  port.postMessage({
    "type": "AddNewAutoCollector", 
    "message":newAutoCollector
  });
}

export function saveUpdatedAutoCollector(updateReportForAutoCollector){

  port.postMessage({
    "type": "UpdateAutoCollector", 
    "message":updateReportForAutoCollector
  });
} 

export function tellNativeTo_deleteAutoCollector(autoCollectorId){

  port.postMessage({
    "type": "DeleteAutoCollector", 
    "message":autoCollectorId
  });
}

export function addHostnameId(hostname,hostnameId){

  port.postMessage({
    "type": "AddHostnameId", 
    "message":{hostname,hostnameId}
  });
}