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
        const password = config.redis.password; //optional

        const reconnectStrategy = (options) => {
            log.info(`${JSON.stringify(options)}`);
            // if (options.error && options.error.code === 'ECONNREFUSED') {
            //     container.resolveSync('Log').info(`${chalk.red('The server refused the connection')}`);
            //     // End reconnecting on a specific error and flush all commands with
            //     // a individual error
            //     return new Error('The server refused the connection');
            // }
            if (options.total_retry_time > 1000 * 60 * 60) {
                log.info(`${chalk.red('Retries Exhausted')}`);
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return;
            }
            log.info(`${chalk.red('Trying to reconnect Redis')}`);
            // reconnect after 3 seconds
            return 3000;
        };

        log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);
        const redisClient = redis.createClient({
            host,
            port,
            password,
            retry_strategy: reconnectStrategy
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
        redisClient.on('error', (err) => {
            log.info(`${chalk.red('Redis Error!')}`);
        });

        redisClient.__set = redisClient.set;
        redisClient.set = function(key, ttl, value, callback) {
            this.__set(key, value, 'EX', ttl, callback);
        };


    container.registerInstance(redisClient, 'RedisClient');
    callback();
};
