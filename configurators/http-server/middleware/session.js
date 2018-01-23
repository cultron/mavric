'use strict';

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    const sessionConfig = config.session;

    if (!sessionConfig || !sessionConfig.key || !sessionConfig.secret || !sessionConfig.ttl) {
        callback(new Error('missing/invalid session config block'));
        return;
    }

    if (!container.isRegistered('RedisClient')) {
        callback(new Error('missing valid redisClient configuration'));
        return;
    }

    container.registerInstance(sessionConfig, 'SessionConfig');

    const connectRedis = require('connect-redis');
    const expressSession = require('express-session');
    //const csurf = require('csurf');
    const redisClient = container.resolveSync('RedisClient');

    const app = container.resolveSync('App');
    const RedisStore = connectRedis(expressSession);

    app.use(expressSession({
        saveUninitialized: true,
        resave: false,
        name: sessionConfig.key,
        secret: sessionConfig.secret,
        proxy: true,
        store: new RedisStore({
            client: redisClient,
            ttl: sessionConfig.ttl
        })
    }));

    callback();
};