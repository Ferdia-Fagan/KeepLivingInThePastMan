
export class AbstractDBCollection {


    constructor(DATABASE, DB_VERSION,STORE_NAME,onUpgradeNeededHandler){
        var openDBReq = indexedDB.open(DATABASE, DB_VERSION);

        const self = this;

        openDBReq.onsuccess = function (evt) {
            self.DB = openDBReq.result;

        };
    
        openDBReq.onerror = function (evt) {
            console.error("openDb:", evt.target.errorCode);
        };

        openDBReq.onupgradeneeded = onUpgradeNeededHandler.bind(self);

        this._STORE_NAME = STORE_NAME;
    }

    /**
     * @description
     * Get the store within a database to then perform a request on
     * 
     * @param {string} store_name
     * @param {string} mode either "readonly" or "readwrite"
     */
    getObjectStore(mode) {
        var request = this.DB.transaction(this._STORE_NAME, mode);
        return request.objectStore(this._STORE_NAME);
    }

    getObjectStoreFromTransaction(mode){
        var tx = this.DB.transaction([this._STORE_NAME], mode);
        var objectStore = tx.objectStore(this._STORE_NAME);
        return [tx,objectStore]
    }


}
