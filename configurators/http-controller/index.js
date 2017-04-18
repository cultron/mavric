var fs = require('fs'),
    path = require('path'),
    async = require('async');

module.exports = function(container, callback) {
    container.registerInstance(require('goa'), 'goa');

    var configurators = [
        require('./error-handling/error-mapping'),
        require('./error-handling/express-error-handler'),
        require('./goa')
    ];

    async.eachSeries(configurators, function(configurator, next) {
        configurator(container, next);
    }, function() {
        var dir = path.join(__dirname);
        fs.readdir(dir, function(err, files) {
            if (err) {
                callback(err);
                return;
            }

            try {
                files
                    .filter(function(filename) {
                        return /\.js$/.test(filename) &&
                            filename !== 'index.js' &&
                            filename !== 'goa.js';
                    })
                    .forEach(function(filename) {
                        container.registerType(require(path.join(dir, filename)));
                    });

                callback();
            } catch (err) {
                callback(err);
            }
        });
    });
};