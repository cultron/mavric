const Sequelize = require('sequelize');
const chalk = require('chalk');
const pg = require('pg');
const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    const database = config.database || {};
    const dbConfig = database.postgres || database.mysql;
    const log = container.resolveSync('Log');

    if (!dbConfig) {
        log.debug('No Database Configuration available!');
        callback();
        return;
    }

    log.debug('Configuring sequelize');
    var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        logging: function(message) {
            if (!log.isDebugEnabled()) {
                return;
            }

            var messageParts = /Executing \((.+?)\):\s+([\s\S]*)/.exec(message);

            if (messageParts) {
                log.debug('SQL[' + chalk.yellow(messageParts[1]) + '] ' + chalk.blue(messageParts[2]));
            } else {
                log.debug(chalk.blue(message));
            }
        },
        dialect: dbConfig.dialect,
        define: {
            charset: 'utf8'
        },
        pool: {
            maxConnections: dbConfig.pool.maxConnections || 20,
            maxIdleTime: dbConfig.pool.maxIdleTime || 30
        }
    });

    if (dbConfig.dialect === 'postgres') {
        //prevent DATE fields being parsed into Date objects with incorrect timezone information
        pg.types.setTypeParser(1082, function (val) {
            return val;
        });
    }

    container.registerInstance(sequelize, 'Sequelize', lifetime.memory());

    callback();
};
