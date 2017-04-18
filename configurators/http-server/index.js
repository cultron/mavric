const chalk = require('chalk');
const async = require('async');

module.exports = (init) => {
    var start = Date.now();

    // jscs:disable disallowIdentifierNames
    process.on('uncaughtException', (err) => {
        const safeLog = log || console;
        safeLog.error('Uncaught exception');
        safeLog.error(err);
        if (err.stack) {
            safeLog.error(err.stack);
        }
        process.exit(1);
    });

    process.on('SIGTERM', () => {
        const message = 'Received SIGTERM, exiting';
        if (log) {
            log.warn(message);
        } else {
            console.log(message);
        }
        process.exit(0);
    });
    // jscs:enable disallowIdentifierNames

    const result = init();
    const container = result.container;
    const configurators = result.configurators;
    const port = container.resolveSync('ExpressPort');
    const config = container.resolveSync('Config');
    const looger = require('looger');

    // with default console transport
    const log = looger.Logger.create(config.log);

    container
        .registerInstance(null, 'ClientIpAddress')
        .registerInstance(log, 'Log');

    async.eachSeries(configurators, (configurator, next) => {
        configurator(container, next);
    }, (err) => {
        if (err) {
            log.error(err);
            process.exit(1);
        }

        const app = container.resolveSync('App');
        const server = app.listen(port);
        const tracker = container.resolveSync('Tracker');

        //https://github.com/nodejs/node/commit/5f76b24e5ee440b7c2d2bdc74a9bb94374df9f2a

        //TODO this should be updated to send a 400 Bad Request response, but node doesn't support it
        //(despite there being a passing test in the node codebase somehow) until v6.x
        //https://github.com/nodejs/node/issues/7126
        function getSignature(socket) {
            return socket.remoteAddress + ':' + socket.remotePort + '->' +
                socket.localAddress + ':' + socket.localPort;
        }

        server.on('connection', (socket) => {
            const signature = chalk.bold(getSignature(socket));
            const remoteAddr = socket.remoteAddress;
            const remotePort = socket.remotePort;

            socket.on('error', (err) => {
                tracker.track('http error', {
                    remoteAddr: remoteAddr,
                    remotePort: remotePort,
                    bytesParsed: err.bytesParsed,
                    code: err.code,
                    message: err.message
                });
                log.warn('socket error for ' + signature + ' (destroyed=' + socket.destroyed + ')', err);
            });
        });
        server.on('clientError', (err) => {
            log.warn('http client connection emitted error', err);
        });

        log.info('Express listening on port ' + chalk.magenta(port));

        if (config.debugExpressRequests) {
            require('./express-debugger')(container);
        }

        const elapsed = Date.now() - start;
        tracker.track('app start', { elapsed: elapsed });
        log.debug('App configured in ' + chalk.yellow(elapsed) + 'ms');
    });
};
