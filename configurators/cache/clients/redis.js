const redis = require('redis');
const chalk = require('chalk');
const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    const configureRedisClient = (container) => {
        const config = container.resolveSync('Config');
        const log = container.resolveSync('Log');

        if (!config.redis) {
            log.info(`${chalk.red('No redis configuration available!')}`);
            callback();
            return;
        }

        const port = config.redis.port;
        const host = config.redis.host;
        const password = config.redis.password || null;

        const createClient = (host, port, password) => {
            log.info(`Connecting to redis on ${chalk.cyan(`${host}:${port}`)}`);
            const redisClient = redis.createClient({ host, port, password });
            redisClient.on('error', (err) => {
                log.error(err);
                process.exit(1); //this may be too harsh, but if your app depends on redis to run, its appropriate.
            });
            return redisClient;
        };

        return createClient(host, port, password);
    };

    container.registerFactory(configureRedisClient, 'RedisClient', lifetime.memory());
    callback();
};
