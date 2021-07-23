import {logWebPageVisitToNativeApplication} from "./CommunicationPort.js"

import {bookmarksCollection,bookmarksCollectionSetRootFolder} from "../datastores/BookmarksCollection.js"
import {checkHostname} from "../datastores/AutoCollector/AutoAnnotatorHostnameCollection.js"

import {webpageTagsCollection} from "../datastores/WebpageTagsCollection.js"

import * as BrowserDataComponent from "../utils/BrowserDataComponent.js"

import {sleep} from "../utils/miscellaneousTools.js"

/**
 * Triggered when sidebar is opened
 */
export var SIDEBAR_WANTS_2B_NOTIFIED_OF_WEBPAGE_CHANGE = false;

// settings:
export var ToIndexAllPages = true;
export var MinimumTotalTime = 2;
export var MinimumTotalVisits = 2;
export var Conditions = null;
export var BookmarksFolderId = null;


export function setUp(){

    let theSettings = browser.storage.local.get("Settings");
    theSettings.then((results) => {
        if(Object.keys(results).length === 0){
            // Set up for the first time
            let createBookMarksRootFolder = browser.bookmarks.create({title:"KeepLivingInThePast_OrganisationFolder"})
            createBookMarksRootFolder.then((results) => {

                browser.storage.local.set({Settings:{toIndexAllPages: true, minimumTotalTime: 2, minimumTotalVisits: 2, conditions: null, bookMarksFolderId: results.id}})
                ToIndexAllPages = true;
                BookmarksFolderId = results.id
                // setRootFolder(results.id);
                // addBookmark(1,results.id,results.id,"root");
                bookmarksCollectionSetRootFolder(results.id);
            });
        }else{
            // Load up previous settings
            ToIndexAllPages = results.Settings.toIndexAllPages
            MinimumTotalTime = results.Settings.minimumTotalTime
            MinimumTotalVisits = results.Settings.minimumTotalVisits
            Conditions = results.Settings.conditions
            BookmarksFolderId = results.Settings.bookMarksFolderId
        }

    });

}
setUp();

export function updateIndexingSettings(updatedSettings){
    ToIndexAllPages = updatedSettings.indexAllPages;

    if(ToIndexAllPages === 'no'){
        MinimumTotalTime = updatedSettings.minimumTotalTime
        MinimumTotalVisits = updatedSettings.minimumTotalVisits
        Conditions = updatedSettings.conditions
    }
    else{
        MinimumTotalTime = 0;
        MinimumTotalVisits = 0;
        Conditions = null;
    }

    browser.storage.local.set({Settings:{toIndexAllPages: ToIndexAllPages, minimumTotalTime: MinimumTotalTime, 
        minimumTotalVisits: MinimumTotalVisits, conditions: Conditions}})

}

// ------------------------------------------------------------------------ end of settings

export function checkIfTheirIsUpdateReport(){   // TODO: THIS IS A HACK FOR THE BETA
    if(BrowserDataComponent.checkIfBrowserDataHasUpdateReport() || bookmarksCollection.checkIfHasUpdateReport() || webpageTagsCollection.checkIfHasUpdateReport()){
        return true;
    }
    return false;
}


/**
 * @description
 * Gets reports from webpages, bookmarks, and webpageTagsCollection, and combines them into one object. This is called by Communication.js
 * 
 * @param {*} willClear -> This decides if will wipe the reports out once extracted. This is the default behaviour (true)
 * @returns
 */
export function getUpdateReports(willClear = true){
    let updateReport = {};
    if(BrowserDataComponent.checkIfBrowserDataHasUpdateReport()){
        updateReport["webpagesUpdateReport"] = BrowserDataComponent.getUpdateReport(willClear);
    }
    if(bookmarksCollection.checkIfHasUpdateReport()){
        updateReport["bookmarkUpdateReport"] = bookmarksCollection.getUpdateReport(willClear);
    }
    if(webpageTagsCollection.checkIfHasUpdateReport()){
        updateReport["tagsUpdateReport"] = webpageTagsCollection.getUpdateReport(willClear);
    }

    return updateReport;
}

/**
 * This is for development view and has been disabled from beta.
 * @returns 
 */
export function getUpdateReportsForDevView(){
    const webpagesUpdateReport = BrowserDataComponent.getUpdateReport(false);
    const webpagesLocalUpdateReport = BrowserDataComponent.getLocalWebpageMetadataUpdateReport(false)
    const bookmarkUpdateReport = bookmarksCollection.getUpdateReport(false);
    const tagsUpdateReport = webpageTagsCollection.getUpdateReport(false);

    return {webpagesUpdateReport,webpagesLocalUpdateReport,bookmarkUpdateReport,tagsUpdateReport}
}

// HANDLE CHANGING OF WEB PAGES:

/**
 * @description
 * handles web page visit
 * 
 * @summary
 * Checks if the web page are visiting is in the RelevantPagesDomainsAndPaths cache.
 * If it is, it will get the respective webPageLoggingId and the respective web page metadata object and store it in the current tab.
 * If it is not, it will ask the native application if have visited this web page before. 
 * 
 * @param {*} webPageUrl 
 * @param {*} tabId 
 * @param {*} timeStamp 
 */
//  async 
function recordWebpageVisit(webPageUrl,tabId, timeStamp){

    const url = new URL(webPageUrl);

    
    const webpageLoggingId = BrowserDataComponent.URL_To_WEBPAGELOGGINGID_CACHEE.getWebpageLoggingIdForURL(url.hostname,url.pathname)



    if(webpageLoggingId !== null){
        BrowserDataComponent.log_CachedWebpage_Visit(tabId,webpageLoggingId,timeStamp);

        if(BrowserDataComponent.tabState.checkIfTabIdIsCurrentActiveTab(tabId) && SIDEBAR_WANTS_2B_NOTIFIED_OF_WEBPAGE_CHANGE){
            // TODO: THEN let the sidebar know

            tellSidebarAboutNewWebpage(BrowserDataComponent.tabState.getWebpageAtTab(tabId));
        }else{

        }
    }else{
        BrowserDataComponent.tabState.markTabAsWaitingForWebpageInfoChange(tabId);

        checkHostname(url.hostname).then(hostnameId => {
            logWebPageVisitToNativeApplication(tabId,url.hostname, url.pathname,hostnameId,timeStamp);
        });
    }
}




/**
 * @description
 * handle web page visit
 * 
 * @summary
 * Will record the web page visit localy and in the native application.
 * 
 * @param {*} details 
 */
function newWebPageLoaded(details) {

    if (details.frameId == 0) {
        recordWebpageVisit(details.url, details.tabId, details.timeStamp)
    }
}
browser.webNavigation.onCompleted.addListener(newWebPageLoaded); 


// Keeping track of tabs:

// TODO: 
function setUpForTabs(){
    // function logTabs(tabs) {
    //     for (let tab of tabs) {
    //         // tab.url requires the `tabs` permission
    //
    //
    //         recordWebPage(tab.url, tab.id, 0)
    //     }
    //
    
    // }
    
    // let querying = browser.tabs.query({});
    // querying.then(logTabs);

    // function saveCurrentTab =

    // (tabInfo) => {
    //     // var theCurrentTime = Date.now();
    //     // newTabFocused(activeInfo.previousTabId,activeInfo.tabId, theCurrentTime)
    //
    //
    //     // BrowserDataComponent.tabState.changeFocusedTab(null,activeInfo.tabId, theCurrentTime)
    //     // BrowserDataComponent.tabState.createBlankTab(currentTab);
    // }

    const getCurrentTab = browser.tabs.query({});
    getCurrentTab.then((tabInfo) => {

        BrowserDataComponent.tabState.createBlankTab(tabInfo[0].id)
        BrowserDataComponent.tabState.setCurrentTab(tabInfo[0].id)
    });
 
}
setUpForTabs()

/**
 * @description
 *  Event handler: Adds tab. 
 * 
 * @param {*} tab 
 */
function tab_Created(tab) {

    // createTab(tab.id);
    BrowserDataComponent.tabState.createBlankTab(tab.id)
}
browser.tabs.onCreated.addListener(tab_Created)

/**
 * @description
 *  Event handler: Removes tab 
 * 
 * @param {*} tab 
 */
function tab_Removed(tabId){
    let theCurrentTime = Date.now();

    BrowserDataComponent.tabState.deleteTab(tabId, theCurrentTime)
}
browser.tabs.onRemoved.addListener(tab_Removed)

/**
 * @description
 *  Event Handler: Changed active tab
 * 
 * @param {*} activeInfo 
 */
function tab_ChangedTab(activeInfo){
    // printAll()


    var theCurrentTime = Date.now();
    // newTabFocused(activeInfo.previousTabId,activeInfo.tabId, theCurrentTime)
    
    BrowserDataComponent.tabState.changeFocusedTab(activeInfo.previousTabId,activeInfo.tabId, theCurrentTime)

    if(SIDEBAR_WANTS_2B_NOTIFIED_OF_WEBPAGE_CHANGE){
        tellSidebarAboutNewWebpage(BrowserDataComponent.tabState.getCurrentWebpage())
    }
}
browser.tabs.onActivated.addListener(tab_ChangedTab);

function tellSidebarAboutNewWebpage(theWebpage){
    if(theWebpage === null){
        browser.runtime.sendMessage({
            messageType:"WebpageChanged",
            webpageLoggingId: null
        })
    }
    else if(theWebpage.metaData.isTagged){
        webpageTagsCollection.getTagsNames(theWebpage.getTags()).then(webpageTags => {
            // TODO: THEN let the sidebar know

            browser.runtime.sendMessage({
                messageType:"WebpageChanged",
                webpageLoggingId: theWebpage.webpageLoggingId,
                webpageTags: webpageTags
            })
        })
    }else{
        browser.runtime.sendMessage({
            messageType:"WebpageChanged",
            webpageLoggingId: theWebpage.webpageLoggingId,
            webpageTags: []
        })
    }

}

/**
 * @description
 * Called by the 'FocusCheckUser.js' in order to unfocus the current tab in order to stop recording the totalVisitTime for the webpage
 */
export function UnfocusOnCurrentTab(){


    var theCurrentTime = Date.now();

    // unfocusCurrentTab(theCurrentTime)

    BrowserDataComponent.tabState.unfocusCurrentTab(theCurrentTime);
}

/**
 * @description
 * Called by the 'FocusCheckUser.js' in order to refocus the current tab in order to continue recording the totalVisitTime for the webpage
 */
export function FocusOnCurrentTab(){


    var theCurrentTime = Date.now();

    // focusCurrentTab(theCurrentTime)
    BrowserDataComponent.tabState.focusOnCurrentTab(theCurrentTime);
}


// BOOKMARKS:
/**
 * @description
 * Handle bookmark creation inside watched folder. 
 * 
 * @summary
 * Handle when a bookmark item (a bookmark or a folder) is created through browser.
 * 
 * @param {*} id 
 * @param {*} bookmarkInfo: {parentId, type, url,title}
 */
async function bookmark_Created(bookmarkKey, bookmarkInfo){

    // bookmarkKey = bookmarkKey.replaceAll("_","")
    // bookmarkKey = bookmarkKey.replaceAll("-","")
    // if(bookmarkFolders.has(bookmarkInfo.parentId)){
    // const bookmarkId = await checkIfBookmarkIsWatched(bookmarkKey);
    const bookmarkParentId = await bookmarksCollection.checkIfBookmarkIsWatched(bookmarkInfo.parentId);

    if(bookmarkParentId !== null){


        if(bookmarkInfo.type === "bookmark"){

            // TODO: Add to native applicaiton

            // Update local web page meta data:

            const url = new URL(bookmarkInfo.url);
            
            var webpageLoggingId = BrowserDataComponent.URL_To_WEBPAGELOGGINGID_CACHEE.getWebpageLoggingIdForURL(url.hostname,
                url.pathname);


            if(webpageLoggingId !== null){

                BrowserDataComponent.changeBookmarkOfWebpage(webpageLoggingId,bookmarkParentId);

                bookmarksCollection.addBookmark(2,bookmarkKey,bookmarkParentId,bookmarkInfo.title,webpageLoggingId);
                
            }else{
                // TODO: Query the native applicaiton to check bookmark url

            }

            // TODO: Update native applicaiton

        }
        else if(bookmarkInfo.type === "folder"){

            // bookmarkFolders.add(bookmarkKey);
            // TODO: Add to native applicaiton
            // currentBookmarkInMiddleOfCreating = {type: 1,bookmarkKey: id, parentKey: bookmarkInfo.parentId, name: bookmarkInfo.title};
            bookmarksCollection.addBookmark(1,bookmarkKey,bookmarkParentId,bookmarkInfo.title);
        }

    }else {

    }
}
browser.bookmarks.onCreated.addListener(bookmark_Created)

/**
 * @description
 * Handle when bookmarks removed from watched folder
 * 
 *  @summary
 *  Fired when a bookmark or folder is removed. When a folder is removed recursively, a single notification is fired for the folder, and none for its contents.
 * 
 * @param {*} id 
 * @param {*} removeInfo: {parentId, node.type}
 */
async function bookmark_Removed(bookmarkKey, removeInfo){

    // bookmarkKey = bookmarkKey.replaceAll("_","")
    // bookmarkKey = bookmarkKey.replaceAll("-","")
    // if(bookmarkFolders.has(removeInfo.parentId)){
    const bookmarkId = await bookmarksCollection.checkIfBookmarkIsWatched(bookmarkKey);
    const bookmarkParentId = await bookmarksCollection.checkIfBookmarkIsWatched(removeInfo.parentId);

    if(bookmarkParentId !== null){

        // if(bookmarkInfo.type === "bookmark"){
        //     // TODO: remove to native applicaiton
        // }
        // else if(bookmarkInfo.type === "folder"){
        //     bookmarkFolders.delete(id);
        //     // TODO: Remove to native applicaiton
        // }
        const bookmarkType = ((removeInfo.node.type === "folder")? 1:2)
        bookmarksCollection.deleteBookmark(bookmarkId,bookmarkType);
    }
}
browser.bookmarks.onRemoved.addListener(bookmark_Removed)


/**
 * @description
 * Handle when user changes bookmarks or folders info (from watched folder).
 * It is also called on completion of creating a folder or bookmark (name).
 * 
 * @summary
 * Fired when there is a change to:
 * - the title or URL of a bookmark
 * -the name of a folder.
 * 
 * @param {*} id 
 * @param {*} changeInfo 
 */
async function bookmark_Changed(bookmarkKey, changeInfo){

    // bookmarkKey = bookmarkKey.replaceAll("_","")
    // bookmarkKey = bookmarkKey.replaceAll("-","")
    // if(bookmarkFolders.has(bookmarkKey)){

    const bookmarkId = await bookmarksCollection.checkIfBookmarkIsWatched(bookmarkKey);

    if(bookmarkId !== null){


        bookmarksCollection.updateBookmark(bookmarkId,changeInfo.title);

        // TODO: update bookmark name localy in the plugin and to the native application

    }else{
        // TODO: Then it is either not a FOLDER in watched folder, or is a bookmark within watched folder

    }

}
browser.bookmarks.onChanged.addListener(bookmark_Changed)

/**
 * @description
 * Handle when user has moved a bookmark or folder within watched folder
 * 
 * @summary
 * Handle when user has moved a folder.
 * 
 * @param {*} id 
 * @param {*} moveInfo : {parentId, oldParentId}
 */
async function bookmark_Moved(bookmarkKey, moveInfo){



    const bookmarkId = await bookmarksCollection.checkIfBookmarkIsWatched(bookmarkKey);
    const bookmarkNewParentId = await bookmarksCollection.checkIfBookmarkIsWatched(moveInfo.parentId);
    const bookmarkOldParentId = await bookmarksCollection.checkIfBookmarkIsWatched(moveInfo.oldParentId);

    if(bookmarkOldParentId !== null){

        if(bookmarkNewParentId !== null){
            // moveBookmark(bookmarkKey,moveInfo.parentId);  
            // const webpageLoggingId = await BookmarksDataComponent.moveBookmark(bookmarkId,bookmarkNewParentId);       // TODO Refactor and remove 'type'
            bookmarksCollection.moveBookmark(bookmarkId,bookmarkNewParentId);       // TODO Refactor and remove 'type'
            
            // if(webpageLoggingId !== null){
            //     // Then the bookmark was a webpage, and not a folder
            //     //

            //     BrowserDataComponent.changeBookmarkOfWebpage(webpageLoggingId,bookmarkNewParentId);
            //     //
            // }
        }else{
            bookmarksCollection.deleteBookmark(bookmarkId);                 
        }
    }else if(bookmarkNewParentId !== null){
        // TODO: bookmark moved from outside of watched area

        var gettingBookmark = browser.bookmarks.get(bookmarkKey);
        gettingBookmark.then((bookmarks)=>{



            // const bookmarkParendId = await checkIfBookmarkIsWatched(bookmarks[0].parentId);

            if(bookmarks[0].type === "folder"){

                // addBookmark(1,bookmarkKey,bookmarkNewParentId,bookmarks[0].title);
                // TODO: add contents of folder
            }else{

                // addBookmark(2,bookmarkKey,bookmarks.parentId,"ima web page");
                // addBookmark(2,bookmarkKey,bookmarkNewParentId,bookmarks[0].title);
                // Update local web page meta data:
                const url = new URL(bookmarks[0].url);


                
                // var webpageLoggingId = RelevantPagesDomainsAndPaths[url.hostname][url.pathname];
                var webpageLoggingId = BrowserDataComponent.URL_To_WEBPAGELOGGINGID_CACHEE.getWebpageLoggingIdForURL(url.hostname,url.pathname);


                
                if(webpageLoggingId !== null){
                    BrowserDataComponent.changeBookmarkOfWebpage(webpageLoggingId,bookmarkNewParentId);
    
                    bookmarksCollection.addBookmark(2,bookmarkKey,bookmarkNewParentId,bookmarks[0].title,webpageLoggingId);

                }else{
                    // TODO: Query the native applicaiton to check bookmark url
                }
            }
        });

    }
}
browser.bookmarks.onMoved.addListener(bookmark_Moved)

/**
 * @description
 * hook for 'BookmarksMappings.js' (BookmarksStore) to update the local webpage datastructures with the update.
 * It is a hooked continuation of 'bookmark_Moved(bookmarkKey, moveInfo)'
 * 
 * @param {*} webpageLoggingId 
 * @param {*} parentBookmarkId 
 */
export function updateWebpageBookmark(webpageLoggingId, parentBookmarkId){

    BrowserDataComponent.changeBookmarkOfWebpage(webpageLoggingId,parentBookmarkId);
}

/**
 * @description
 * Used to update the webpage tags for a webpage.
 * This is updated from the sidebar UI.
 * 
 * @param {*} webpageLoggingId 
 * @param {*} tagReport  -> {"tagReport": [[tagId,isAdded]...],"newTagsAdded":[tagName,tagName,...}
 */
export async function updateWebpageTagsWithReport(webpageLoggingId,tagReport){

    // const currentWebpageLoggingId = BrowserDataComponent.tabState.getCurrentWebpageId();

    // if("hasNoTags" in tagReport){
    //     BrowserDataComponent.webPageLoggingIdsMap.get(webpageLoggingId)
    // }else{
    if("tagReport" in tagReport){

        webpageTagsCollection.updateExistingTabsForWebpage(tagReport.tagReport,webpageLoggingId);

        BrowserDataComponent.webpageMetadataTempStore.get(webpageLoggingId).updateTagsWithReport(tagReport.tagReport);


    }

    if("newTagsAdded" in tagReport){

        webpageTagsCollection.addNewTagsForWebpage(tagReport.newTagsAdded,webpageLoggingId);
    }
    // }
        
    // let [isCached,tagId] = WebpageTags.addTag(tag);

    // if(isCached){
    //
    // }else{
    //
        
    // }

    // BrowserDataComponent.tabState.addTagToWebpage(tagReport.tagReport)
}

/**
 * @description
 * hook for 'webpageTagsCollection.js' (webpageTagsStore) to update the local webpage datastructures with the update.
 * It is a hooked continuation of 'updateWebpageTagsWithReport(webpageLoggingId,tagReport)'
 * 
 * @param {*} webpageLoggingId 
 * @param {*} updateReport 
 */
export function updateTagsOfWebpagesLocally(webpageLoggingId,updateReport){


    BrowserDataComponent.webpageMetadataTempStore.get(webpageLoggingId).addTags(updateReport);

}

/* export function getTagsStartingWith(tagPrefix){


    const p = Promise.resolve((WebpageTags.getSimilarTags(tagPrefix)))

    return p
} */

/**
 * @description
 *  Used to get all the tags from the store. 
 * This is called to use with textarea tags.
 * 
 * @returns Promise.resolve(allTags)
 */
export function getAllTags(){


    const p = Promise.resolve((webpageTagsCollection.getAllTags()))
    return p;
}

export async function getAllBookmarks(){

    const bookmarks = await Promise.resolve(browser.bookmarks.getSubTree(BookmarksFolderId))

    // function getTreeOfBookmarks(bookmarkId, name, children){
    //     var bookmarkChildren = []
    //     for(let bookmark of children){
    //
    //         if(bookmark.type === "folder"){
    //             // {bookmarkId, name, children}
    //             bookmarkChildren.push(getTreeOfBookmarks(bookmark.id,bookmark.title,bookmark.children))
    //         }
    //     }

    //     return {bookmarkId,name,bookmarkChildren}
    // }
    var bookmarksPathsMap = new Map();
    function getTreeOfBookmarks(bookmarkId, name, children){
        var bookmarkChildren = [];
        for(let childBookmark of children){
            if(childBookmark.type === "folder"){
                bookmarkChildren.push(childBookmark.id)
                getTreeOfBookmarks(childBookmark.id,childBookmark.title,childBookmark.children);
            }
            
        }
        bookmarksPathsMap.set(bookmarkId, {name, bookmarkChildren})
    }

    // const bookmarksAsTree = getTreeOfBookmarks(bookmarks[0].id, bookmarks[0].title, bookmarks[0].children)
    getTreeOfBookmarks(bookmarks[0].id, bookmarks[0].title, bookmarks[0].children)

    // if(bookmarks[0].children !== undefined){
    //     for(let bookmark of bookmarks[0].children){
    //
    //         if(bookmark.type = "folder"){
    //             // {bookmarkId, name, children}
    //             bookmark.id
    //             bookmark.title
    //         }
    //     }
    // }

    return {rootId: bookmarks[0].id, bookmarksPathsMap};
}

export async function getBookmarksIds(bookmarkKeys){
    const bookmarkIds = await bookmarksCollection.getBookmarkIds(bookmarkKeys)
    return bookmarkIds;
}

/**
 * @description
 * Used to get the tags for the current web page.
 * 
 * @returns Promise.resolve({webpageLoggingId, tags})
 */
export async function getCurrentWebpageTags(letSidebarKnowOfWebpageChange){


    if(letSidebarKnowOfWebpageChange){
        SIDEBAR_WANTS_2B_NOTIFIED_OF_WEBPAGE_CHANGE = true;
    }

    async function getCurrentWebpageTagsHelper(letSidebarKnowOfWebpageChange){
    
        const webpageLoggingId = BrowserDataComponent.tabState.getCurrentWebpageId()

        const webpageTags_Ids = BrowserDataComponent.tabState.getCurrentTabWebpageTags()

        if(webpageTags_Ids.length !== 0){

            const webpageTags = await webpageTagsCollection.getTagsNames(webpageTags_Ids)
            // const p = Promise.resolve({webpageLoggingId, tags: WebpageTags.getTagsNames(webpageTags_Ids)})
            // p.then(result =>
            // return p
            return {webpageLoggingId, tags: webpageTags}
        }else{
            const p = {webpageLoggingId, tags: []}
            return p
        }
    }




    if(BrowserDataComponent.tabState.checkIfCurrentTabIsOnNullPage()){

        return Promise.resolve({webpageLoggingId: null, tags: []});
    }

    if(BrowserDataComponent.tabState.checkIfCurrentTabIs_NOT_MarkedAsWaitingForWebpageInfoChange()){


        return getCurrentWebpageTagsHelper(letSidebarKnowOfWebpageChange);
    }else{
        
        // wait untill current tab webpage is done retrieving information from local application (i.e. logWebpageVisit).
        do {
            await sleep(500);
        } while(BrowserDataComponent.tabState.checkIfCurrentTabIs_NOT_MarkedAsWaitingForWebpageInfoChange());


        return getCurrentWebpageTagsHelper(letSidebarKnowOfWebpageChange);
    }

}


