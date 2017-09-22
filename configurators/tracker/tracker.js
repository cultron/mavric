const  chalk = require('chalk');

module.exports = (container, callback) => {
    const log = container.resolveSync('Log');

    function logError(callback) {
        return function(err) {
            if (err) {
                log.error('Tracker error', err);
            }

            callback && callback(err);
        };
    }

    class Tracker {
        constructor(/** Log */log,
                    /** Mixpanel */mixpanel) {
            this.mixpanel = mixpanel;
            this.log = log;
        }

        track(event, properties, callback) {
            if (typeof(properties) === 'function') {
                callback = properties;
                properties = {};
            }

            this.log.debug('tracking event [' + chalk.yellow(event) + ']', properties);

            if (!this.mixpanel) {
                callback && callback();
                return;
            }

            this.mixpanel.track(event, properties, logError(callback));
        }
    }

    container.registerType(Tracker);

    callback();
};
