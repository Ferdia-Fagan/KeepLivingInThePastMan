import {getUpdateReportsForDevView,updateIndexingSettings,updateWebpageTagsWithReport,
    getAllTags,getAllBookmarks,getCurrentWebpageTags} from "./BrowserStateManager.js"
import {sendUpdateReport, requestQuery,saveNewAutoCollector,saveUpdatedAutoCollector,tellNativeTo_deleteAutoCollector,addHostnameId} from "./CommunicationPort.js"

import {webpageMetadataTempStore,tabState,updateLocalStorage} from "../utils/BrowserDataComponent.js"

import {addNewAutoCollector,updateAutoCollector,deleteAutoCollector,getAllAutoCollectors,getAutoCollector} from "../datastores/AutoCollector/AutoAnnotatorCollection.js"
import {getAllHostnames,addHostname} from "../datastores/AutoCollector/AutoAnnotatorHostnameCollection.js"

import {webpageTagsCollection} from "../datastores/WebpageTagsCollection.js"

/**
 * @description
 * recieves local messages within the browser plugin.
 * 
 * @summary
 * The messages this handles are:
 * - updateIndexingSettings
 * 
 * @param {*} msg 
 * @param {*} sender 
 * @param {*} sendResponse 
 */
function recieveInternalMessage(msg,sender,sendResponse){

    if(msg.messageType === "Query"){        
        return requestQuery(msg.query)
    }
    if(msg.messageType === "updateIndexingSettings"){
        updateIndexingSettings(msg);
    }
    else if(msg.messageType === "sendUpdateReport"){
        sendUpdateReport();
        updateLocalStorage();
    }
    else if(msg.messageType === "ChangeTagsOfWebPage"){

        updateWebpageTagsWithReport(msg.webpageLoggingId,msg.tagsReport)
    }
    else if(msg.messageType === "TellSystemAnnotationUIIsOpen"){


        const allTags = getAllTags()
        const currentWebpageTags = getCurrentWebpageTags(true)

        return Promise.all([allTags,currentWebpageTags]).then(results => {

            return {allTags:results[0],webpageAndTags:results[1]}
        })

        // resultsProm.then(results => {

        // })

        //
        // return Promise.resolve({allTags:results[0],webpageAndTags:results[1]})

    }
//     else if(msg.messageType === "GetTagSuggestions"){
//
//         // getTagsStartingWith(msg.tagPrefix,sendResponse);
//         // suggestions.then((response) => {
//         //
//         //     // tabs[tabId] = {title: response.title,hostName:hostName, pathName: pathName};
//         //     // sendWebPageScrapings(webPageId, scrapeTheWebPage(response.scrapedContent));
//         //     return Promise.resolve({theSuggestions: "here"});
//         // });
//         //
// /*         return new Promise(resolve => {
//             getTagsStartingWith(msg.tagPrefix,sendResponse), 1000
//         }); */
//         // return new Promise((resolve, reject) => {
//         //     setTimeout(function(){
//         //         resolve(getTagsStartingWith(msg.tagPrefix,resolve))
//         //     }, 1000);
//         // });
//         const result = await getTagsStartingWith(msg.tagPrefix)
//         return Promise.resolve( result)
//             // {theSuggestions: "here"});
//         // return true;
//         // return Promise.resolve( {theSuggestions: "here"});
//     }
    else if(msg.messageType === "GetAllTags"){
        // const result = await getAllTags()
        return getAllTags().then(result =>{
            return result
        })
        //
        // return Promise.resolve(result)
    }
    
    else if(msg.messageType === "GetAllTagsAndBookmarks"){
        // const allTags = await getAllTags()
        const allTags = getAllTags()
        // const bookmarksData = await getAllBookmarks()
        const bookmarksData = getAllBookmarks()
        //
        //
        //
        return Promise.all([allTags,bookmarksData]).then(results =>{
            return {allTags: results[0],bookmarksData: results[1]}
        })

        // return Promise.resolve({allTags,bookmarksData})
    }

    else if(msg.messageType === "GetAllHostnames"){
        return getAllHostnames().then(result => {
            return result;
        });
    }

    else if(msg.messageType === "GetAllAutoCollectors"){

        return getAllAutoCollectors().then(result => {
            return result;
        });
    }

    else if(msg.messageType === "GetAutoCollector"){
        return getAutoCollector(msg.autoCollectorId);
    }

    else if(msg.messageType === "CreateAutoCollector"){
        return addNewAutoCollector(msg.newAutoCollector).then(givenIdForNewAutoCollector => {
            msg.newAutoCollector["id"] = givenIdForNewAutoCollector;
            delete msg.newAutoCollector["name"];

            saveNewAutoCollector(msg.newAutoCollector);
            
            return givenIdForNewAutoCollector;
        })
    }
    else if(msg.messageType === "UpdateAutoCollector"){
        // So send autoCollectorUpdated to AutoCollectorCollection
        // and send autoCollectorUpdates to native application



        // if(msg.autoCollectorUpdates.updatedTagsById){

        // }
    
        updateAutoCollector(msg.autoCollectorUpdated);
        
        saveUpdatedAutoCollector(msg.autoCollectorUpdates);
        
        return;
    }

    else if(msg.messageType === "DeleteAutoCollector"){
        deleteAutoCollector(msg.autoCollectorId)

        tellNativeTo_deleteAutoCollector(msg.autoCollectorId)

        return;
    }

    else if(msg.messageType === "AddHostnameToCollection"){

        browser.tabs.query({active: true})
            .then((tabs) => {
                const activeTabsUrl = tabs[0].url;
                if(activeTabsUrl !== "about:blank"){
                    const url = new URL(activeTabsUrl);
                    const currentWebpageHostname = url.hostname;
                    
                    addHostname(currentWebpageHostname).then(hostnameId =>{

                        addHostnameId(currentWebpageHostname,hostnameId);
                    })
                }

            })

        return;
    }

    else if(msg.messageType === "GetCurrentWebpageTags"){
        // const result = await getCurrentWebpageTags()
        return getCurrentWebpageTags()
        //
        // return Promise.resolve(result)
        // return Promise.resolve( {webpageLoggingId:1, tags: []})
    }

    else if(msg.messageType === "getData"){

        if(msg.dataName === "loadUpdateReport"){
            let theDataToReturn = Object.entries(getUpdateReportsForDevView());
            return Promise.resolve({theData: theDataToReturn});
        }
        else if(msg.dataName === "loadWebpageData"){
            let webpageMetaData = Array.from(webpageMetadataTempStore)
            return Promise.resolve({theData: webpageMetaData});
        }
        else if(msg.dataName === "loadTabsData"){
            let tabsData = tabState.getData();
            return Promise.resolve({theData: tabsData});
        }
    }

    else if(msg.messageType === "AddNewTags"){

        let newTags = msg.newTags;
        return webpageTagsCollection.addNewTagsAndGetTagIds(newTags);

    }
    return;
}

browser.runtime.onMessage.addListener(recieveInternalMessage)