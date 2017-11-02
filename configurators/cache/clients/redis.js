const redis = require('redis');
const chalk = require('chalk');
const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    if (!container.resolveSync('Config').redis) {
        container.resolveSync('Log').info(`${chalk.red('No redis configuration available!')}`);
        callback();
        return;
    }

    const createClient = (container) => {
        const config = container.resolveSync('Config');
        const log = container.resolveSync('Log');
        const port = config.redis.port;
        const host = config.redis.host;
        const password = config.redis.password; //optional

        const reconnectStrategy = (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        };

        log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);
        const redisClient = redis.createClient({
            host,
            port,
            password,
            retry_strategy: reconnectStrategy
        });
        redisClient.on('error', (err) => {
            log.error('Redis Error:', err);
            process.exit(1); //this may be too harsh, but if your app depends on redis to run, its appropriate.
        });

        redisClient.__set = redisClient.set;
        redisClient.set = function(key, ttl, value, callback) {
            this.__set(key, value, 'EX', ttl, callback);
        };
        return redisClient;
    };

    container.registerFactory(createClient, 'RedisClient', lifetime.memory());
    callback();
};
