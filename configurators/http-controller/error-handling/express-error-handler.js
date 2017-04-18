var chalk = require('chalk');

module.exports = (container, callback) => {
    var app = container.resolveSync('App'),
        log = container.resolveSync('Log');

    //this function must have an arity of 4!
    app.use((err, req, res, next) => {
        if (err.code === 'EBADCSRFTOKEN') {
            var referrer = chalk.yellow(req.headers.referer || '[no referrer]'),
                userAgent = chalk.blue(req.headers['user-agent']),
                ip = chalk.yellow(req.ip);
            log.warn('Invalid CSRF from ' + referrer + ' to ' + req.url + ' by ' + ip + ' (' + userAgent + ')');
            res.status(403);
            if (req.xhr) {
                res.json({ message: 'Invalid form submission' });
            } else {
                res.send('Invalid form submission');
            }
            return;
        }

        log.error('Express error occurred', err);
        res.status(err.statusCode || 500);
        if (req.xhr) {
            res.json({ message: 'An error occurred' });
        } else {
            res.send('An error occurred');
        }
    });

    callback();
};
