
const MAX = 200;

/**
 * @description
 * This is a cache of the recently visited web pages (during session)
 * 
 * <hostName -> <pathName, webPageLoggingId> )>
 * 
 * @summary
 * - Keep track of web pages that have recently visit and their webPageLoggingIds
 */
export class WebpagesCache {
    constructor(){
        /**
         *  hostName -> pathName -> webpageLoggingId
         */
        this.URLCachee = new Map();
    }

    /**
     * 
     * @param {*} hostName 
     * @param {*} pathName 
     * @returns webPageLoggingId or null (if not cached)
     */
    getWebpageLoggingIdForURL(hostName,pathName){
        if(this.URLCachee.has(hostName)){
            const hostMap = this.URLCachee.get(hostName);
            if(hostMap.has(pathName)){
                return hostMap.get(pathName);
            }else{
                return null;
            }
        }else{
            this.URLCachee.set(hostName, new Map([
                [pathName,-1]
            ]))
            return null;
        }
    }

    cacheeURLWebpageLoggingId(hostName,pathName,webpageLoggingId){
        this.URLCachee.get(hostName).set(pathName,webpageLoggingId);
        if(this.URLCachee.size == MAX){  //TODO: cache completion
            this._freeSpaceInCache();
        }
    }

    _freeSpaceInCache(){
        let keysToRemove = Array.from(this.URLCachee.keys()).slice(0, 50);     // drop 10% of cache (KeyValues added first) 
        keysToRemove.forEach(keyToRemove => this.URLCachee.delete(keyToRemove));
    }
} 