'use strict';
const chalk = require('chalk');

module.exports = (container, callback) => {
    const app = container.resolveSync('App');
    const log = container.resolveSync('Log');


    app.use((err, req, res, next) => {
        log.error('Express error occurred', err);
        res.status(err.statusCode || 500);
    });

    callback();
};
