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

        log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);
        const redisClient = redis.createClient({
            host,
            port,
            password
        });
        redisClient.on('error', (err) => {
            log.error(err);
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
