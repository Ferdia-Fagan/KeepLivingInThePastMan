import {updateTagsOfWebpagesLocally} from "../background_scripts/BrowserStateManager.js"

import {AbstractDBCollection} from "./AbstractDBCollection.js";


class WebpageTagsCollection extends AbstractDBCollection {

    // /**
    //  * @description
    //  * <webpageLoggingId -> Set(tagIds)>
    //  */
    // #tagsUpdateReport;

    constructor(DATABASE, DB_VERSION,STORE_NAME){
        
        function onUpgradeNeededHandler(event){
            // This will set up the DS

            var objectStore = event.currentTarget.result.createObjectStore(
                // STORE_NAME, { keyPath: 'bookmarkKey', autoIncrement: true });
                STORE_NAME, { keyPath: 'id', autoIncrement: true });
      
            objectStore.createIndex('value', 'value', { unique: true });
    
        }

        super(DATABASE, DB_VERSION,STORE_NAME,onUpgradeNeededHandler);


        this._tagsUpdateReport = new Map();

    }

    checkIfHasUpdateReport(){
        return (this._tagsUpdateReport.size !== 0)
    }

    getUpdateReport(willClear){

        let tagsUpdateReportArr = Array.from(this._tagsUpdateReport)
        if(willClear){
            this._tagsUpdateReport = new Map();
        }
    
        for(let [i,[webpageLoggingId,webpageTagUpdates]] of tagsUpdateReportArr.entries()){


            let tagsAddedToWebpage = []
            let tagsRemovedFromWebpage = []
            for(let [tagId,isAdded] of webpageTagUpdates){

                if(isAdded){
                    tagsAddedToWebpage.push(tagId)
                }else{
                    tagsRemovedFromWebpage.push(tagId)
                }
            }
            tagsUpdateReportArr[i][1] = [tagsAddedToWebpage,tagsRemovedFromWebpage]
        }
        return tagsUpdateReportArr;
    }


    updateExistingTabsForWebpage(tagReport, webpageLoggingId){


        this._tagsUpdateReport.set(webpageLoggingId, tagReport);
    

    }

    addNewTagsAndGetTagIds(newTags){
        // let store = super.getObjectStore('readwrite');

        // store.add


        var [tx,objectStore] = super.getObjectStoreFromTransaction('readwrite');

        // var newTagIds = new Array(newTags.length);
        var newTagIds = []
        
        newTags.forEach(newTag => {
            let addTag_Req = objectStore.add({value:newTag});
            addTag_Req.onsuccess = function(newTagId){
                newTagIds.push({id: newTagId.target.result,value:newTag});
            }
            
        })
        // let req = objectStore.add(newTags[0])

        // return tx.oncomplete = () => {
        //     return newTagIds;
        // }

        return new Promise((resolve, reject) => {
            tx.oncomplete = function(event) {

                resolve(newTagIds)
            }
        })
    
        // tx.oncomplete = function(event) {
        //
        //     newTagIds.forEach(newTagId => {
        //
        //     })
        // }
    }


    addNewTagsForWebpage(newTagsReport, webpageLoggingId){
        // tagsUpdateReport.set(webpageLoggingId, tagReport);
    

        let store = super.getObjectStore('readwrite');
    
        if(!this._tagsUpdateReport.has(webpageLoggingId)){
            this._tagsUpdateReport.set(webpageLoggingId, [])
        }
    
        const numberOfNewTags = newTagsReport.length
    
        const self = this;
        var addNewTagsRequest = new Promise((resolve, reject) => {
            var newTagReport = []
            for (const item of newTagsReport) {
                let req = store.add({value: item})
        
                req.onsuccess = function(evt){

                    const newTagId = evt.target.result;
        
                    self._tagsUpdateReport.get(webpageLoggingId).push([newTagId,true])
        
                    newTagReport.push(newTagId);
        

    
                    if(newTagReport.length == numberOfNewTags){

                        resolve(newTagReport)
                    }
        
                    // TAG_CACHE.set(evt.target.result,tagAdding)
                    //
                    // newTagsReport.add(evt.target.result);
                    
                    // updateReport_AddTag(tagId,webpageLoggingId)
                }
            
            
                req.onerror = function(evt){

                }
            }
    
        })
    
        addNewTagsRequest.then(newTagReport =>{

            updateTagsOfWebpagesLocally(webpageLoggingId,newTagReport);
        })
    
    
        
        // let req = store.index('tag').get(tagChecking);
    }
    
    async getAllTags(){
    

        let store = super.getObjectStore('readonly');
    
        let allTagsReq = store.getAll();
    
        // let allTags = 
    
        return new Promise((resolve, reject) => {
            allTagsReq.onsuccess = function(event) {

                // var cursor = event.target.result;
                resolve(event.target.result)
                
            };
    
            allTagsReq.onerror = function (evt) {
                console.error("geting similar results did not work")
                resolve();
            };
        });
    
    }
    
    
    async getTagsNames(tagIds){

    
        let store = super.getObjectStore('readonly');

        var tagNames = []
        await new Promise((resolve, reject) => {
            
            var numberOfTags = tagIds.length

            for(let tagId of tagIds){
    /*             if(TAG_CACHE.has(tagId)){
                    tagNames.push(TAG_CACHE.get(tagId))
                }
                else{ */
                const getTagByIdReq = store.get(tagId)
    
                getTagByIdReq.onsuccess = function(event) {
                    tagNames.push(event.target.result)
                    // TAG_CACHE.set(tagId, event.target.result)
                    
                    if(tagNames.length == numberOfTags){

                        resolve(tagNames)
                    }
                }
    
                getTagByIdReq.onerror = function (evt) {
                    console.error("geting similar results did not work")
                    resolve();
                };
                // }
            }
            
        });
    
        return tagNames;
    
        // return tagNames
    
        // await tagNamesRequest
        //
        // return tagNamesRequest
    }

}

export const webpageTagsCollection = new WebpageTagsCollection("UserGeneratedData",1,"WebpageTags")

export function getTagsNames(tagIds){
    return webpageTagsCollection.getTagsNames(tagIds)
}