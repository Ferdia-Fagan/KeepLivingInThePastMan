import {AbstractDBCollection} from "../AbstractDBCollection.js"

import {getTagsNames} from "../WebpageTagsCollection.js"
import {getHostnamesFromIds} from "../AutoCollector/AutoAnnotatorHostnameCollection.js"



/**
 * @description
 * 
 * 
 * @summary
 * The schema: (id,{name,tagIds,hostIds})
 */
class AutoAnnotatorCollection extends AbstractDBCollection {

    constructor(DATABASE, DB_VERSION,STORE_NAME){
        function createDatabase(event){
            // This will set up the DS

            var objectStore = event.currentTarget.result.createObjectStore(
                // STORE_NAME, { keyPath: 'bookmarkKey', autoIncrement: true });
                // STORE_NAME, { keyPath: 'id'});
                STORE_NAME, { keyPath: 'id', autoIncrement: true });
      
            objectStore.createIndex('name', 'name', { unique: true });

        }

        super(DATABASE, DB_VERSION,STORE_NAME,createDatabase);
        
    }
     

    /**
     * 
     * @param {*} newAutoCollector -> {name, tagIds, hostIds}
     */
    addAutoCollector(newAutoCollector){

        var store = this.getObjectStore('readwrite');

        var addAutoCollectorReq = store.add(newAutoCollector);

        return new Promise((resolve,reject)=> {
            addAutoCollectorReq.onsuccess = function(evt){

                resolve(evt.target.result);
            }

            addAutoCollectorReq.onerror = function(evt){

                resolve();
            }
        })
    }

    updateAutoCollector(updatedAutoCollector){
        var store = this.getObjectStore('readwrite');

        let getOriginal = store.get(updatedAutoCollector.id);

        getOriginal.onsuccess = function(originalAutoCollector){
            let theOriginalAutoCollector = originalAutoCollector.target.result;
            Object.keys(updatedAutoCollector).forEach(k => {
                theOriginalAutoCollector[k] = updatedAutoCollector[k];
            })
            store.put(theOriginalAutoCollector);
        }
        
    }

    deleteAutoCollector(autoCollectorId){
        var store = this.getObjectStore('readwrite');
        
        store.delete(autoCollectorId);
    }


    /**
     * 
     * @returns Promise to return all autoCollectors. [{name, tagIds,hostIds}]
     */
    getAllAutoCollectors(){
        let store = this.getObjectStore('readonly');

        const autoCollectorIndex = store.index('name');

        // let getAllAutoCollectorsReq = autoCollectorIndex.getAllKeys();
        return new Promise((resolve, reject) => {
            var allAutoCollectors = [];

            autoCollectorIndex.openCursor().onsuccess = function(e) {
                const cursor = e.target.result;
                if(cursor) {
                     // logs 'IDB for Newbies'
                     // logs 123
                    cursor.continue();
                    allAutoCollectors.push([cursor.primaryKey,cursor.key])
                }else{
                    resolve(allAutoCollectors);
                }

            };
        });
        // let getAllAutoCollectorsReq = store.getAll();

        // return new Promise((resolve, reject) => {
        //     getAllAutoCollectorsReq.onsuccess = function(event) {
        //         // var cursor = event.target.result;
        //         resolve(event.target.result)
                
        //     };
    
        //     getAllAutoCollectorsReq.onerror = function (evt) {
        //         console.error("error occured when trying to get all auto collectors")
        //         resolve();
        //     };
        // });
    }


    getAutoCollector(autoCollectorId){
        let store = this.getObjectStore('readonly');

        var getAutoCollectorByIdReq = store.get(autoCollectorId);

        return new Promise((resolve, reject)=>{
            getAutoCollectorByIdReq.onsuccess = function(event){

                resolve(event.target.result);
            }
        })

    }

    


}

export const autoAnnotatorCollection = new AutoAnnotatorCollection("AutoAnnotatorCollection",1,"AutoAnnotatorPaths")

export function getAllAutoCollectors(){
    
    return autoAnnotatorCollection.getAllAutoCollectors();
}

export async function getAutoCollector(autoCollectorId){
    let autoCollector = await autoAnnotatorCollection.getAutoCollector(autoCollectorId);
        
    let tagIdsToPairValues;
    if(autoCollector.tagIds.length !== 0){
        tagIdsToPairValues = getTagsNames(autoCollector.tagIds).then(tagNames =>{
            autoCollector.tagIds = tagNames;
        });
    }else{
        tagIdsToPairValues = Promise.resolve()
    }

    let hostIdsToPairValues
    if(autoCollector.hostIds.length !== 0){
        hostIdsToPairValues = getHostnamesFromIds(autoCollector.hostIds).then(hostnames => {
            autoCollector.hostIds = hostnames;
        });
    }else{
        hostIdsToPairValues = Promise.resolve()
    }

    await Promise.all([tagIdsToPairValues,hostIdsToPairValues])



    
    return autoCollector;

}

export function addNewAutoCollector(newAutoCollector){
    return autoAnnotatorCollection.addAutoCollector(newAutoCollector);
}

export function updateAutoCollector(updatedAutoCollector){
    autoAnnotatorCollection.updateAutoCollector(updatedAutoCollector);
}

export function deleteAutoCollector(autoCollectorId){
    autoAnnotatorCollection.deleteAutoCollector(autoCollectorId)
}

// export function getAutoCollectorsForHostnameId(hostnameId){
    
// }



// class X extends AbstractDBCollection {

//     constructor(){
//         super();
//     }

//     calc() {
//
//     }
// }


// export function theFunctionIsHere(){

//
//     var x = new X();
//     x.calc();
// }













