'use strict';

const redis = require('redis');
const chalk = require('chalk');

module.exports = (container, callback) => {
    const log = container.resolveSync('Log');

    const config = container.resolveSync('Config');
    const redisConfig = config.redis;

    if (!redisConfig || !redisConfig.host || !redisConfig.port) {
        log.warn(chalk.yellow('missing/invalid redis config block'));
        callback();
        return;
    }

    const port = redisConfig.port;
    const host = redisConfig.host;

    log.info('Connecting to redis on ' + chalk.magenta(host + ':' + port));

    const redisClient = redis.createClient({
        host: host,
        port: port
    });

    redisClient.on('error', (err) => {
        log.error(err);
        process.exit(1);
    });

    redisClient.on('ready', () => {
        log.debug('redis ready');
    });
    redisClient.on('connect', () => {
        log.debug('redis connected');
    });
    redisClient.on('reconnecting', () => {
        log.debug('redis reconnecting');
    });
    redisClient.on('warning', (msg) => {
        log.warn('redis warning', msg);
    });

    container
        .registerInstance(redisConfig, 'RedisConfig')
        .registerInstance(redisClient, 'RedisClient');

    callback();
};