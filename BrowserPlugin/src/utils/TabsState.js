
import {ToIndexAllPages} from "../background_scripts/BrowserStateManager.js"


/**
 * @description
 * <tabId -> (currentWebPageLoggingId, lastLogTime,metaData:)>
 * 
 * @summary
 * - Keeps track of current tabs,
 * - logging the total log
 * - saving the meta data for the web page
 */
export class TabsState {

    constructor(){
        this.tabs = new Map();
        this.currentFocusedTabId = null;
    }

    setCurrentTab(tabId){
        this.currentFocusedTabId = tabId;
    }

    checkIfTabIdIsCurrentActiveTab(tabId){
        return this.currentFocusedTabId  === tabId;
    }

    getWebpageAtTab(tabId){
        return this.tabs.get(tabId);
    }

    createBlankTab(tabId){

        this.tabs.set(tabId,null)
    }

    markTabAsWaitingForWebpageInfoChange(tabId) {
        this.tabs.set(tabId,false);
        // .waitingForWebpageInfoChange = true;
    }

    // markTabAsDoneWaitingForWebpageInfoChange(tabId){
    //     this.tabs.set(tabId,true);
    //     // this.tabs.get(tabId).waitingForWebpageInfoChange = false;
    // }

    checkIfCurrentTabIs_NOT_MarkedAsWaitingForWebpageInfoChange(){
        return this.tabs.get(this.currentFocusedTabId);
    }

    checkIfCurrentTabIsOnNullPage(){
        return this.tabs.get(this.currentFocusedTabId) === null;
    }

    // addTab(tabId,webpageLoggingId,isIndexed,metaData){
    //     tabs
    // }

    deleteTab(tabId, timeStamp){
        if(this.tabs.has(tabId)){

            if(tabId == this.currentFocusedTabId && !ToIndexAllPages){
                // let x = this.tabs.get(tabId)
                //


                this.tabs.get(tabId).logVisitTime(timeStamp);
                // logVisitTime(timeStamp)
            }
            this.tabs.delete(tabId);
        }
    }

    setTabWebpage(tabId, newWebpageOnTab, timeStamp){
        // this.printTheTabsIds()
        // if(this.tabs.has(tabId)){



        // if(!ToIndexAllPages){
        //     const oldWebpageOnTab = this.tabs.get(tabId)
        //     if(oldWebpageOnTab !== null){
        //         if(!oldWebpageOnTab.isIndexed){
        //             this.tabs.get(tabId).logVisitTime(timeStamp);
        //         }
        //     }
        //     if(!newWebpageOnTab.isIndexed){
        //         newWebpageOnTab.logVisitStartTime(timeStamp);
        //     }
        // }

        if(!ToIndexAllPages && this.tabs.has(tabId)){
            const currentTabWebpage = this.tabs.get(tabId)
            if(currentTabWebpage !== null){
                currentTabWebpage.logVisitTime(timeStamp);
            }
            
            // if(!newWebpageOnTab.isIndexed){
            newWebpageOnTab.logVisitStartTime(timeStamp);
            // }
        }
        
        this.tabs.set(tabId, newWebpageOnTab)

        // }
    }

    changeFocusedTab(prevFocusedTabId, newFocusedTabId, timeStamp){

        this.currentFocusedTabId = newFocusedTabId;

        
        if(this.tabs.has(prevFocusedTabId)){
            const previousTabWebpage = this.tabs.get(prevFocusedTabId)
            if(previousTabWebpage !== null && !ToIndexAllPages){
                // then the tab was not removed and so should log time

                previousTabWebpage.logVisitTime(timeStamp)
                // logWebPageVisitTime(activeInfo.previousTabId,time);
            }
        }

        if(this.tabs.has(newFocusedTabId)){
            const newFocusedTabWebpage = this.tabs.get(newFocusedTabId)

            if(newFocusedTabWebpage !== null){
                if(!ToIndexAllPages){
                    // logWebPageStartTime(currentTabId, time);

                    newFocusedTabWebpage.logVisitStartTime(timeStamp)
                }

            }
        }
    }

    focusOnCurrentTab(timeStamp){

        const currentTabWebpage = this.tabs.get(this.currentFocusedTabId)
        if(currentTabWebpage !== null){
            currentTabWebpage.unpauseLoggingVisitTime(timeStamp)
        }
    }

    unfocusCurrentTab(timeStamp){

        const currentTabWebpage = this.tabs.get(this.currentFocusedTabId)
        if(!ToIndexAllPages && currentTabWebpage !== null){
            currentTabWebpage.logVisitTime(timeStamp,true)
        }
    }
    
    // addTagToWebpage(tag){
    //     const currentTabWebpage = this.tabs.get(this.currentFocusedTabId)
    //     if(currentTabWebpage !== null){
    //         currentTabWebpage.addTagToWebpage(tag)
    //     }
    // }

    getCurrentTabWebpageTags(){


        if(this.tabs.get(this.currentFocusedTabId)){   //TODO: this is a hack for beta

            return this.tabs.get(this.currentFocusedTabId).getTags();
        }
    }

    getCurrentWebpageId(){



        return this.tabs.get(this.currentFocusedTabId).webpageLoggingId
    }

    getCurrentWebpage(){
        return this.tabs.get(this.currentFocusedTabId)
    }

    // helpers:

    // printTheTabsIds(){

    //     for (let key of this.tabs.keys()) {


    //     }
    // }

    // getData(){
    //     return Array.from(this.tabs)
    // }

}