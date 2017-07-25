const redis = require('redis');
const chalk = require('chalk');
const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    const configureRedisClient = (container, callback) => {
        const config = container.resolveSync('Config');
        const log = container.resolveSync('Log');

        if (!config.redis) {
            log.info(`${chalk.red('No redis configuration available!')}`);
            callback();
            return;
        }

        const port = config.redis.port;
        const host = config.redis.host;

        const createClient = (host, port, done) => {
            log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);
            const redisClient = redis.createClient(port, host);
            redisClient.on('error', (err) => {
                log.error(err);
                process.exit(1); //this may be too harsh, but if your app depends on redis to run, its appropriate.
            });

            done(null, redisClient);
        };

        createClient(host,port, callback);
    };

    container.registerFactory(configureRedisClient, 'RedisClient', lifetime.memory());
    callback();
};
