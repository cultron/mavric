'use strict';

const redis = require('redis');
const chalk = require('chalk');
const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    if (!container.resolveSync('Config').redis) {
        container.resolveSync('Log').info(`${chalk.red('No redis configuration available!')}`);
        callback();
        return;
    }

        const config = container.resolveSync('Config');
        const log = container.resolveSync('Log');
        const port = config.redis.port;
        const host = config.redis.host;

        log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);

        const redisClient = redis.createClient({
            host,
            port
        });

        redisClient.on('error', (err) => {
            log.info(`${chalk.red('Redis Error!')}`);
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

    container.registerInstance(redisClient, 'RedisClient');
    callback();
};
