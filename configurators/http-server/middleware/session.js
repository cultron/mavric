'use strict';

module.exports = (container, callback) => {
    const log = container.resolveSync('Log');
    const config = container.resolveSync('Config');
    const sessionConfig = config.session;

    if (!sessionConfig || !sessionConfig.key || !sessionConfig.secret || !sessionConfig.ttl) {
        log.warn('missing/invalid session config block');
        callback();
        return;
    }

    if (!container.isRegistered('RedisClient')) {
        callback(new Error('missing valid redisClient configuration'));
        return;
    }

    container.registerInstance(sessionConfig, 'SessionConfig');

    const connectRedis = require('connect-redis');
    const expressSession = require('express-session');
    const redisClient = container.resolveSync('RedisClient');

    const app = container.resolveSync('App');
    const RedisStore = connectRedis(expressSession);

    if (!sessionConfig.override) {
        app.use(expressSession({
            saveUninitialized: sessionConfig.saveUninitialized,
            resave: sessionConfig.resave,
            name: sessionConfig.key,
            secret: sessionConfig.secret,
            proxy: sessionConfig.proxy,
            cookie: sessionConfig.cookie,
            store: new RedisStore({
                client: redisClient,
                ttl: sessionConfig.ttl
            })
        }));
    }

    callback();
};