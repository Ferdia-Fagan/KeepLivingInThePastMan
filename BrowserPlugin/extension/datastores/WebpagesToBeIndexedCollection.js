import {AbstractDBCollection} from "./AbstractDBCollection.js";

if (!indexedDB) {

}
class WebpagesToBeIndexedCollection extends AbstractDBCollection {

    constructor(DATABASE, DB_VERSION,STORE_NAME){
        function createDatabase(event){
            // This will set up the DS

            var objectStore = event.currentTarget.result.createObjectStore(
                // STORE_NAME, { keyPath: 'bookmarkKey', autoIncrement: true });
                STORE_NAME, { keyPath: 'webpageLoggingId', autoIncrement: false});
    
        }

        super(DATABASE, DB_VERSION,STORE_NAME,createDatabase);

    }

    /**
     * @description
     * Add web page logging id to track web pages that have not been indexed yet.
     * 
     * @param {*} webpageLoggingId 
     */
    addWebpage(webpageLoggingId){
        let store = this.getObjectStore(STORE_NAME, 'readwrite');

        store.add({webpageLoggingId: webpageLoggingId,totalVisitCount: 0, totalVisitTime: 0})
    }

    async getWebpage(webpageLoggingId){
        let store = this.getObjectStore(STORE_NAME, 'readonly');

        let webpageReq = store.get(webpageLoggingId)

        const webpageReqPromise = new Promise((resolve, reject) => {
            webpageReq.onsuccess = function(result){

                
                if(result.target.result != undefined){
                    resolve(result.target.result)
                }else{
                    addWebpage(webpageLoggingId)
                    resolve({webpageLoggingId: webpageLoggingId,totalVisitCount: 0, totalVisitTime: 0})
                }
                
            }

            webpageReq.onerror = function(error){

                addWebpage(webpageLoggingId)
                resolve({totalVisitCount: 0, totalVisitTime: 0})
            }
        });

        return webpageReqPromise;
        
    }

    updateWebpage(webpageLoggingId, updateReport){

        let store = this.getObjectStore(STORE_NAME, 'readwrite');

        let webpageReq = store.get(webpageLoggingId)

        webpageReq.onsuccess = function(result){
            const webpageToUpdate = result.target.result

            if("totalVisitCount" in updateReport){
                webpageToUpdate.totalVisitCount = updateReport.totalVisitCount
            }
            if("totalVisitTime" in updateReport){
                webpageToUpdate.totalVisitTime = updateReport.totalVisitTime
            }

            store.put(webpageToUpdate)
        }


        
    }

}

export const webpagesToBeIndexedCollection = new WebpagesToBeIndexedCollection("WebpagesData",1,"WebpagesToBeIndexed")

