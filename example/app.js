'use strict';

const chalk = require('chalk');
const mavric = require('../');
const sahara = require('sahara');
const container = new sahara.Container();
const startTime = Date.now();

const config = {
    app: {
        port: 3000,
        name: 'Mavric Example Web App',
        defaultAction: 'handle'
    },
    session: {
        key: 'sid',
        secret: 'wine is fine, whiskey is swell, but beer is better',
        ttl: 60 * 60 * 24
    },
    redis: {
        port: 6379,
        host: 'localhost'
    },
    log: {
        level: 'debug',
        timestamps: 'quiet',
        colorize: true
    },
};

container
    .registerInstance(__dirname, 'AppDir')
    .registerInstance(config, 'Config')
    .registerInstance(config.app.name, 'AppName');

const configurators = [
    mavric.Configurator.Core,
    mavric.Configurator.Cache,
    mavric.Configurator.HttpServer,
    // add all your application modules and other custom middleware here
    require('./configurators/modules'),

    // start http listener
    mavric.HttpServer.Listener
];

mavric.Core.configure(configurators, container, (err) => {
    if (err) {
        console.error(err);
        err.stack && console.error(err.stack);
        process.exit(1);
    }

    const log = container.resolveSync('Log');
    log.debug(`App configured in ${chalk.yellow(Date.now() - startTime)}ms`);
});


