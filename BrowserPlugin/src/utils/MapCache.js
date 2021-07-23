

export class MapCache{

    constructor(maxSize, clearSize){
        /**
         *  hostName -> pathName -> webpageLoggingId
         */
        this.cache = new Map();

        this._MAX_SIZE = maxSize;
        this._CLEAR_SIZE = clearSize;
    }

    get(key){
        return this.cache.get(key)
    }

    set(key,value){
        this.cache.set(key,value)
        if(this.cache.size == this._MAX_SIZE){
            clearSpace();
        }
    }

    has(key){
        return this.cache.has(key);
    }

    clearSpace(){
        let keysToRemove = Array.from(this.cache.keys()).slice(0, this._CLEAR_SIZE);     // drop 10% of cache (KeyValues added first) 
        keysToRemove.forEach(keyToRemove => this.cache.delete(keyToRemove));
    }

}



