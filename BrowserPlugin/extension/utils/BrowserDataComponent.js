import {WebpageData, getWebpagesHaveUpdated, getWebpagesMetadataHaveUpdatedLocally,checkIfWebpagesMetadataHasBeenUpdatedLocally,
    checkIfWebpagesHaveBeenUpdated} from "./WebpageData.js";

import {scrapeWebPage} from "../background_scripts/ScrapingManager.js";

import {ToIndexAllPages,MinimumTotalTime,MinimumTotalVisits } from "../background_scripts/BrowserStateManager.js";

import {TabsState} from "./TabsState.js";
import {WebpagesCache} from "./WebpagesCache.js";

import {webpagesToBeIndexedCollection} from "../datastores/WebpagesToBeIndexedCollection.js";

import {MapCache} from "./MapCache.js";

/**
 * State view of tabs
 */
export const tabState = new TabsState();

/**
 * hostname -> pathname -> id 
 */
export const URL_To_WEBPAGELOGGINGID_CACHEE = new WebpagesCache();

/**
 * @description
 * This is used to map recently visited web pages and their meta data (useing the webPageLoggingId)
 * 
 * <WebPageLoggingId -> WebPageData>
 */
export var webpageMetadataTempStore = new MapCache(1000,100);

export function changeBookmarkOfWebpage(webpageLoggingId,parentBookmarkId){
    webpageMetadataTempStore.get(webpageLoggingId).bookmarkWebpage(parentBookmarkId);
}

export function checkIfLocalStorageHasUpdateReport(){// TODO: THIS IS A HACK FOR THE BETA
    return checkIfWebpagesMetadataHasBeenUpdatedLocally();
}

export function updateLocalStorage(willClear = true){

    const webpagesLocalUpdateReport = getLocalWebpageMetadataUpdateReport(willClear)

    for(let [webpageLoggingId,updates] of webpagesLocalUpdateReport){

        if("webpageToBeIndexedUpdateReport" in updates){
            webpagesToBeIndexedCollection.updateWebpage(webpageLoggingId, updates["webpageToBeIndexedUpdateReport"])
        }
    }
}

export function checkIfBrowserDataHasUpdateReport(){// TODO: THIS IS A HACK FOR THE BETA
    return checkIfWebpagesHaveBeenUpdated();
}

/**
 * @description
 * used to make update report of web page meta data.
 * 
 * @summary
 * Uses WebPagesToBeUpdatedOnApplication to make update report of meta data of web pages.
 * This is then sent to the native application.
 */
export function getUpdateReport(clearUpdates = true){


    var webpagesUpdateReport = [];

    const webpagesHaveUpdated = getWebpagesHaveUpdated(clearUpdates)

    // var otherUpdateReports = {};
    for(let wpLoggingIdThatHasUpdate of webpagesHaveUpdated){
        // let [webpageUpdateReport,otherUpdates] = webPageLoggingIdsMap.get(wpLoggingIdThatHasUpdate).getUpdatesForReport(clearUpdates);
        const webpageUpdateReport = webpageMetadataTempStore.get(wpLoggingIdThatHasUpdate).getUpdatesForReport(clearUpdates);

        webpagesUpdateReport.push({webpageLoggingId: wpLoggingIdThatHasUpdate,
                                    updates: webpageUpdateReport})

        // for (const otherUpdateType in otherUpdates) {
        //     if(otherUpdateType in otherUpdateReports){
        //         otherUpdateReports[otherUpdateType].push(otherUpdates[otherUpdateType])
        //     }else{
        //         otherUpdateReports[otherUpdateType] = [otherUpdates[otherUpdateType]];
        //     }
        // }

    }


    //

    return webpagesUpdateReport;    
}

export function getLocalWebpageMetadataUpdateReport(clearUpdates = true){


    var webpagesMetadataLocalUpdateReport = [];

    const webpageMetadataLocalUpdates = getWebpagesMetadataHaveUpdatedLocally(clearUpdates)

    for(let wpLoggingIdThatHasUpdate of webpageMetadataLocalUpdates){
        const webpageLocalUpdateReport = webpageMetadataTempStore.get(wpLoggingIdThatHasUpdate).getLocalUpdatesForWebpage(clearUpdates);
        webpagesMetadataLocalUpdateReport.push([wpLoggingIdThatHasUpdate,webpageLocalUpdateReport])
        // webpagesMetadataLocalUpdateReport.push({webpageLoggingId: wpLoggingIdThatHasUpdate,
                                    // updates: webpageLocalUpdateReport})
    }


    return webpagesMetadataLocalUpdateReport
}


export function log_CachedWebpage_Visit(tabId,webpageLoggingId, timeStamp){


    let theWebPage = webpageMetadataTempStore.get(webpageLoggingId);



    tabState.setTabWebpage(tabId, theWebPage, timeStamp);

    // checkHostname(urlHostname).then(hostnameId => {
    //     if(hostnameId !== undefined){
    //

    //     }
    // });

    if(!theWebPage.metaData.isIndexed){

        if(ToIndexAllPages || theWebPage.metaData.visitCount >= MinimumTotalVisits || theWebPage.metaData.totalVisitTime >= MinimumTotalVisits){

            scrapeWebPage(tabId, currentWebPageLoggingId);
        }
    }

}

/**
 * 
 * @param {*} returnedMetaData -> example {"requestResponseId":0,"webPageId":1,"theMetaData":"","messageType":"webPageData"}
 * @param {*} tabId 
 * @param {*} hostName 
 * @param {*} pathName 
 * @param {*} haveHostAlready 
 */
export function log_NoneCachedWebpage_Visit(tabId, hostName, pathName,timeStamp,returnedMetaData){



    var newWebpageData = new WebpageData(returnedMetaData.webpageLoggingId, returnedMetaData.isIndexed,returnedMetaData.isTagged,timeStamp, returnedMetaData.metadata);
    // newWebpageData.logVisit();



    URL_To_WEBPAGELOGGINGID_CACHEE.cacheeURLWebpageLoggingId(hostName,pathName,returnedMetaData.webpageLoggingId);

    webpageMetadataTempStore.set(returnedMetaData.webpageLoggingId,newWebpageData);
    // webPageLoggingIdsMap = new Map()
    // webPageLoggingIdsMap.set(1,1);

    

    tabState.setTabWebpage(tabId,newWebpageData,timeStamp); // TODO: THIS IS WHERE THE ISSUE IS WHERE THE NULL CAUSES ERROR FOR ANNOTATING WEBPAGES QUICKLY FROM STARTUP

    // tabState.markTabAsDoneWaitingForWebpageInfoChange(tabId);

/*     if(SIDEBAR_WANTS_2B_NOTIFIED_OF_WEBPAGE_CHANGE){
        // TODO: THEN let the sidebar know
    } */

    if(!newWebpageData.metaData.isIndexed){

        if(!ToIndexAllPages){

            webpagesToBeIndexedCollection.getWebpage(newWebpageData.webpageLoggingId).then(result => {

                newWebpageData.setIndexingCheckpointMarkers(result)
                newWebpageData.logVisit();

                if(newWebpageData.metaData.totalVisitCount > MinimumTotalVisits || newWebpageData.metaData.totalVisitTime > MinimumTotalTime){

                    scrapeWebPage(tabId, returnedMetaData.webpageLoggingId);
                    newWebpageData.markAsIndexed()
                }else{

                }
            });
        }else{

            scrapeWebPage(tabId, returnedMetaData.webpageLoggingId);
            newWebpageData.markAsIndexed()
        }
        
    }

}


// export function AddHostnameToCollectionWithWebpageId(webpageLoggingId){
//     webpageMetadataTempStore.get(webpageLoggingId);
// }
