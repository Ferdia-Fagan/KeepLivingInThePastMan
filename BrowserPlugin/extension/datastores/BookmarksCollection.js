import {updateWebpageBookmark} from '../background_scripts/BrowserStateManager.js'

import {AbstractDBCollection} from "./AbstractDBCollection.js";

import {MapCache} from "../utils/MapCache.js"



class BookmarksCollection extends AbstractDBCollection {

    constructor(DATABASE, DB_VERSION,STORE_NAME){
        function createDatabase(event){
            // This will set up the DS

            var objectStore = event.currentTarget.result.createObjectStore(
                // STORE_NAME, { keyPath: 'bookmarkKey', autoIncrement: true });
                STORE_NAME, { keyPath: 'id', autoIncrement: true });
      
            objectStore.createIndex('bookmarkKey', 'bookmarkKey', { unique: true });
            objectStore.createIndex('parentId', 'parentId', { unique: false });
    
        }

        super(DATABASE, DB_VERSION,STORE_NAME,createDatabase);


        // this.BOOKMARK_KEY_CACHE = new Map()
        /**
         *  bookmarkKey -> bookmarkId
         */
        this.BOOKMARK_KEY_CACHE = new MapCache(100,50);

        /**
         * Keeps track of updates from the 
         */
        this.bookmarksAddedReport = new Map();
        this.bookmarksMovedReport = new Map();
        this.bookmarksDeletedReport = new Set();

    }

    checkIfHasUpdateReport(){ // TODO: THIS IS A HACK FOR THE BETA
        if(this.bookmarksAddedReport.size !== 0 || this.bookmarksMovedReport.size !== 0 || this.bookmarksDeletedReport.size !== 0){
            return true;
        }
        return false;
    }

    /**
     * @description
     * Extract update report to be used to send to native application to update bookmarks.
     * 
     * @param {*} willClear -> if true, cleares the update report (this is default for production. False should only be used for dev mode) 
     * @returns
     */
    getUpdateReport(willClear){
        let updateReport = {}
        
        if(this.bookmarksAddedReport.size !== 0){
            let bookmarksAddedReportArray = Array.from(this.bookmarksAddedReport);
            if(willClear){
                this.bookmarksAddedReport = new Map();
            }

            for(var i = 0; i < bookmarksAddedReportArray.length; i++){
                bookmarksAddedReportArray[i] = [].concat.apply([], bookmarksAddedReportArray[i])
            }
            updateReport.bookmarksAddedReport = bookmarksAddedReportArray



        }
        if(this.bookmarksMovedReport.size !== 0){
            updateReport.bookmarksMovedReport = Array.from(this.bookmarksMovedReport);
            if(willClear){
                this.bookmarksMovedReport = new Map();
            }

        }
        if(this.bookmarksDeletedReport.size !== 0){
            updateReport.bookmarksDeletedReport = Array.from(this.bookmarksDeletedReport);
            if(willClear){
                this.bookmarksDeletedReport = new Map();
            }

        }
        
        return updateReport;
    }

    async getIdOfBookmarkKey(bookmarkKey, store = null){


        if(store === null){

            var store = this.getObjectStore('readwrite');
        }
    
        // printAll();
        if(this.BOOKMARK_KEY_CACHE.has(bookmarkKey)){
            return this.BOOKMARK_KEY_CACHE.get(bookmarkKey)
        }else{
            var req = store.index('bookmarkKey').get(bookmarkKey);
    
            var bookmarkId;

            const self = this;
    
            await new Promise((resolve, reject) => {
                req.onsuccess = function(evt) {
                    //
                    //
                    // const bookmarkId = evt.target.result.id;
                    // bookmarkId = evt.target.result.id;

                    if (typeof evt.target.result == 'undefined') {

                        // return null;
                        bookmarkId = null;
                        // bookmarkId = null;
                        resolve();
                    }else{


                        self.BOOKMARK_KEY_CACHE.set(bookmarkKey,bookmarkId)
                        // bookmarkId = evt.target.result.id
                        bookmarkId = evt.target.result.id
                        resolve();
                    }
                    // return bookmarkId;
                };
                req.onerror = function (evt) {
                    console.error("deletePublicationFromBib:", evt.target.errorCode);
                    bookmarkId = null;
                    resolve();
                };
            });
    
            return bookmarkId;
        }
    }
    
    /**
     * @description
     * Used to check if bookmarks is in the root folder of chosen folder within bookmarks
     * 
     * @param {*} bookmarkKey 
     * @returns
     */
    async checkIfBookmarkIsWatched(bookmarkKey){


    
        if(bookmarkKey === "toolbar_____" || bookmarkKey === "unfiled_____"){
            return null;
        }
        
        // return false;
        var bookmarkId = null;
        if(this.BOOKMARK_KEY_CACHE.has(bookmarkKey)){

            bookmarkId = this.BOOKMARK_KEY_CACHE.get(bookmarkKey);
            return bookmarkId
        }else{
            const bookmarkIdReq = this.getIdOfBookmarkKey(bookmarkKey);
    
            return bookmarkIdReq;
        }
    }
    
    addBookmark(type, bookmarkKey, parentId, name, webpageLoggingId=null){

        // if(store === null){
        var store = this.getObjectStore('readwrite');
        

    
        var newBookmark = {bookmarkKey: bookmarkKey, type: type, parentId: parentId};
        
        if(webpageLoggingId !== null){
            newBookmark.webpageLoggingId =  webpageLoggingId;
        }
    
        var req;
        try {
            req = store.add(newBookmark);
        } catch (e) {
            if (e.name == 'DataCloneError')
                console.log("This engine doesn't know how to clone a Blob, " +
                                    "use Firefox");
            throw e;
        }

        const self = this;
    
        req.onsuccess = function (evt) {

            //


            const bookmarkId = req.result; 
    
            self.BOOKMARK_KEY_CACHE.set(bookmarkKey,bookmarkId);
            
            if(type === 2){
                 ;
                self.bookmarksAddedReport.set(bookmarkId, [parentId,webpageLoggingId])

            }
        };
    
        req.onerror = function(event) {
            console.error("addPublication error", event.target.errorCode);
        };
    }
    
    deleteBookmark(bookmarkId){


    
        var store = getObjectStore('readwrite');
        
        this.BOOKMARK_KEY_CACHE.delete(bookmarkId)
        var getBookmarkByIdReq = store.get(bookmarkId);
        
        getBookmarkByIdReq.onsuccess = function(evt) {
    


    
            if(evt.target.result.type === 2){
                // then is webpage bookmark
                if(this.bookmarksAddedReport.has(bookmarkId)){
                    this.bookmarksAddedReport.delete(bookmarkId)
                }else{
                    this.bookmarksDeletedReport.add(bookmarkId)
                }
                
                updateWebpageBookmark(evt.target.result.webpageLoggingId, null);
            }
            
            var deleteReq = store.delete(bookmarkId);
            var getChildren = store.index('parentId').getAllKeys(bookmarkId);
            getChildren.onsuccess = function(event){
                // var cursor = event.target.result;


                for(const child of getChildren.result){
                    this.deleteBookmark(child,store);             
                }
    
            }
            getChildren.onerror = function(evt){

            }
        };
        getBookmarkByIdReq.onerror = function (evt) {
            console.error("deletePublication:", evt.target.errorCode);
        };
    }
    
    updateBookmark(bookmarkId, newName){

    
        var store = this.getObjectStore('readwrite');
    
        var getById = store.get(bookmarkId);
    
        getById.onsuccess = function(evt){
            getById.result.name = newName;
            store.put(getById.result);

        }
        getById.onerror = function(evt){

        }
    
    }
    
    async moveBookmark(bookmarkId, newParentId){



        var store = this.getObjectStore('readwrite');
    
        var type,webpageLoggingId = null;
    
        var getByIdReq = store.get(bookmarkId);
    
        // await new Promise((resolve, reject) => {
        let self = this;
        getByIdReq.onsuccess = function(evt){
            getByIdReq.result.parentId = newParentId;
            store.put(getByIdReq.result);
    
            type = getByIdReq.result.type;
            if(type == 2){
                if(self.bookmarksAddedReport.has(bookmarkId)){
                    self.bookmarksAddedReport.get(bookmarkId)[0] = newParentId
                }else{
                    self.bookmarksMovedReport.set(bookmarkId, newParentId)
                }
                
                updateWebpageBookmark(getByIdReq.result.webpageLoggingId, newParentId);
            }
    

            // resolve()
        }
        getByIdReq.onerror = function(evt){

            
            resolve()
        }
        // }); 
    
        // return webpageLoggingId;
    
    }
    
    async getBookmarkIds(bookmarkKeys){

    
        var store = this.getObjectStore('readonly');
    
        var bookmarkKeyIndex = store.index('bookmarkKey');
    
        var bookmarkIds = []
    
        await new Promise((resolve, reject) => {
            var numberOfBookmarks = bookmarkKeys.length;
    
            for(let bookmarkKey of bookmarkKeys){
                const getBookmarkByKeyReq = bookmarkKeyIndex.getKey(bookmarkKey)
    
                getBookmarkByKeyReq.onsuccess = function(event){
                    bookmarkIds.push(event.target.result)
    
                    if(bookmarkIds.length == numberOfBookmarks){

                        resolve()
                    }
                }
            }
        })
        //
        return bookmarkIds;
        
    }

    printAll(){

    
        var store = this.getObjectStore('readonly');
    
        let getReq = store.getAll()
    
        getReq.onsuccess = function(evt) {
            // var cursor = evt.target.result;

            // cursor.continue();
        };
        getReq.onerror = function (evt) {
            console.error("deletePublication:", evt.target.errorCode);
        };
    }

}

export const bookmarksCollection = new BookmarksCollection("BookmarksMappings",1,"BookmarksPaths")

export function bookmarksCollectionSetRootFolder(rootKey){

    var store = bookmarksCollection.getObjectStore('readwrite');

    store.add({bookmarkKey: rootKey, type: 2, parentId: 1, name: "root"});
    bookmarksCollection.BOOKMARK_KEY_CACHE.set(rootKey,1);

}
