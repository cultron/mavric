var chalk = require('chalk'),
    uuid = require('node-uuid');

module.exports = function expressDebugger(container) {
    var log = container.resolveSync('Log'),
        config = container.resolveSync('Config'),
        app = container.resolveSync('App');

    log.debug('configuring express debugger');
    //this is all temporary debugging
    var originalHandle = app.handle;
    app.handle = function(req) {
        req.id = config.logRequestIds ? chalk.gray('[' + uuid.v4() + ']') + ' ' : '';

        //jacked from the proxyaddr module, which is what express does
        var proxyAddrs = (req.headers['x-forwarded-for'] || '')
            .split(/ *, */)
            .filter(Boolean)
            .reverse();
        var socketAddr = req.connection.remoteAddress;
        var addrs = [socketAddr].concat(proxyAddrs);
        var addr = addrs[addrs.length - 1];
        var message = req.id + [
            chalk.magenta('[express init]'),
            chalk.gray('ip:' + addr),
            req.method,
            req.url,
            'HTTP/' + req.httpVersion
        ].join(' ');

        log.info(message);
        originalHandle.apply(this, arguments);
    };
};
