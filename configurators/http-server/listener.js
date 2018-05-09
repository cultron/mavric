'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

module.exports = (container, callback) => {
    const port = container.resolveSync('AppPort');
    const app = container.resolveSync('App');
    const log = container.resolveSync('Log');

    const server = app.listen(port, () => {
        log.info(`Express listening on port ${port}`);
        callback();
    });

    function getSignature(socket) {
        return `${socket.remoteAddress}:${socket.remotePort}->${socket.localAddress}:${socket.localPort}`;
    }

    server.on('connection', (socket) => {
        const signature = chalk.bold(getSignature(socket));

        socket.on('error', (err) => {
            log.warn('socket error for ' + signature + ' (destroyed=' + socket.destroyed + ')', err);
        });
    });
    server.on('clientError', (err) => {
        log.warn('http client connection emitted error', err);
    });
};