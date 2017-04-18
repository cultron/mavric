'use strict';
const Mavric = require('../');
const sahara = require('sahara');

const config = {
    api: {
        port: 3000,
        name: 'Mavric Example Web App'
    },
    postgres: {
        host: 'localhost',
        username: 'root',
        password: 'password',
        database: 'database',
        schema: 'database',
        port: 54321,
        reconnect: {
            maxRetries: 10,
            interval: 1000
        },
        pool: {
            maxConnections: 20,
            maxIdleTime: 30
        }
    }
};
Mavric.HttpServer(() => {
    const container = new sahara.Container()
        .registerInstance(__dirname, 'AppRoot')
        .registerInstance(config, 'Config')
        .registerInstance(config.api.port, 'ExpressPort')
        .registerInstance(config.api.name, 'AppName');

    const configurators = [
        Mavric.Helper,
        Mavric.Tracker,
        Mavric.Database,
        require('./configurators/express'),
        require('./configurators/modules'),
        Mavric.HttpController
    ];

    return {
        container: container,
        configurators: configurators
    };
});
