const chalk = require('chalk');

class Tracker {
        constructor(/** Log */log,
                    /** Mixpanel */mixpanel) {
            this.mixpanel = mixpanel;
            this.log = log;
        }

        logError(callback) {
            return function (err) {
                if (err) {
                    log.error('Tracker error', err);
                }

                callback && callback(err);
            };
        }

        saveUser(id, properties, callback) {
            if (typeof(properties) === 'function') {
                callback = properties;
                properties = {};
            }

            if (!id) {
                throw new Error('Missing Distinct Id for user');
            }

            if (!this.mixpanel) {
                callback && callback();
                return;
            }

            this.mixpanel.people.set(id, properties, (err) => {
                if (this.mixpanel.identify) {
                    this.mixpanel.identify(id);
                }

                this.logError(callback)(err);
            })
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

            this.mixpanel.track(event, properties, this.logError(callback));
        }
    }

module.exports = Tracker;