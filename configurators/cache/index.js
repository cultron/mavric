const async = require('async');
const CacheInterfaceFactory = require('./cache-interface-factory');

const configurator = (container, callback) => {
    const config = container.resolveSync('Config');

    container.registerType(CacheInterfaceFactory);

    const configurators = [
        require('./clients/redis')
    ];

    async.eachSeries(configurators, (configurator, next) => configurator(container, next), (err) => {
        // const hasRedis = container.isRegistered('RedisClient');
        // if (hasRedis) {
        //     const redisClient = container.resolveSync('RedisClient');
        //     const redisCache = container.resolveSync('CacheInterfaceFactory').create('RedisCache', redisClient);
        //     container.registerInstance(redisCache, 'RedisCache')
        // }

        callback();
    });
};

module.exports = {
    Configurator: configurator
};
