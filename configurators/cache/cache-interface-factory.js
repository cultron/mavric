const CacheInterface = require('./cache-interface');

class CacheInterfaceFactory {
    constructor(/** Log */log) {
        this.log = log;
    }

    create(cacheName, cacheClient) {
        return new CacheInterface(cacheName, cacheClient, this.log);
    }
}

module.exports = CacheInterfaceFactory;
