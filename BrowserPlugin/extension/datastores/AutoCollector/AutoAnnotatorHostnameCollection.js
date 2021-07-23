import {AbstractDBCollection} from "../AbstractDBCollection.js"

import {MapCache} from "../../utils/MapCache.js"


/**
 * @description
 * 
 * @summary
 * The schema: (id, {hostname})
 */
class AutoAnnotatorHostnameCollection extends AbstractDBCollection {

    constructor(DATABASE, DB_VERSION,STORE_NAME){
        function createDatabase(event){
            // This will set up the DS

            var objectStore = event.currentTarget.result.createObjectStore(
                // STORE_NAME, { keyPath: 'bookmarkKey', autoIncrement: true });
                STORE_NAME, { keyPath: 'id', autoIncrement: true });
      
            objectStore.createIndex('hostname', 'value', { unique: true });

        }

        super(DATABASE, DB_VERSION,STORE_NAME,createDatabase);


        /**
         *  hostname -> hostnameId
         */
        this.HOSTNAME_CACHEE = new MapCache(100,25);

    }

    addHostname(hostname){
        var store = super.getObjectStore('readwrite');

        var addHostnameReq = store.add({value:hostname});
        
        const self = this;
        return new Promise((resolve,reject) => {

            addHostnameReq.onsuccess = function(evt){

                self.HOSTNAME_CACHEE.set(hostname,evt.target.result);
                resolve(evt.target.result);
            }

            addHostnameReq.onerror = function(evt){

                resolve();
            }
        });
    }

    checkHostname(hostname){
        var store = this.getObjectStore('readonly');

        if(this.HOSTNAME_CACHEE.has(hostname)){
            return Promise.resolve(this.HOSTNAME_CACHEE.get(hostname));
        }else{
            const hostnameIndex = store.index('hostname');

            var hostnameIdReq = hostnameIndex.getKey(hostname);

            return new Promise((resolve,reject) => {

                hostnameIdReq.onsuccess = function(evt){

                    resolve(evt.target.result);
                }

                hostnameIdReq.onerror = function(evt){

                    resolve();
                }
            })     
        }
        
    }

    getAllHostnames(){
        var store = this.getObjectStore('readonly');

        const hostnameReq = store.getAll()

        return new Promise((resolve,reject) => {
            hostnameReq.onsuccess = function(evt){

                resolve(evt.target.result);
            }

            hostnameReq.onerror = function(evt){

                resolve();
            }
        });
    }

    getHostnamesFromIds(hostnameIds){
        var [tx,store] = super.getObjectStoreFromTransaction('readwrite');

        var hostnamesFromIds = [];
        hostnameIds.forEach(hostnameId => {
            let getHostnameById = store.get(hostnameId);
            getHostnameById.onsuccess = function(hostname){
                hostnamesFromIds.push(hostname.target.result)
            }
        })

        return new Promise((resolve, reject) => {
            tx.oncomplete = function(event) {

                resolve(hostnamesFromIds)
            }
        });

    }


    async getHostnames(hostnames){
        var store = this.getObjectStore('readonly');

        const hostnameIndex = store.index('hostname');

        var hostnameIds = []
    
        const self = this;
        await new Promise((resolve, reject) => {
            var numberOfHostnamesLookingFor = hostnames.length;
    
            for(let hostname of hostnames){

                if(self.HOSTNAME_CACHEE.has(hostname)){
                    hostnameIds.push(self.HOSTNAME_CACHEE.get(hostname));
                    
                    if(hostnameIds.length == numberOfHostnamesLookingFor){

                        resolve()
                    }
                }else{
                    const getHostnameIdReq = hostnameIndex.getKey(hostname)
        
                    getHostnameIdReq.onsuccess = function(event){
                        hostnameIds.push(event.target.result)
        
                        if(hostnameIds.length == numberOfHostnamesLookingFor){

                            resolve()
                        }
                    }                    
                }

            }
        })
        //
        return hostnameIds;
    }


}

export const autoAnnotatorHostnameCollection = new AutoAnnotatorHostnameCollection("AutoAnnotatorHostnameCollection",1,"AutoCollectorHostnamePaths")


export function getAllHostnames(){
    return autoAnnotatorHostnameCollection.getAllHostnames();
}

export function addHostname(hostname){
    return autoAnnotatorHostnameCollection.addHostname(hostname)
}

export function checkHostname(hostname){
    return autoAnnotatorHostnameCollection.checkHostname(hostname);
}

export function getHostnamesFromIds(hostnameIds){
    return autoAnnotatorHostnameCollection.getHostnamesFromIds(hostnameIds);
}