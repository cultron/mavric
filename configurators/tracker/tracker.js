const chalk = require('chalk');

class Tracker {
        constructor(/** Log */log,
                    /** Mixpanel */mixpanel) {
            this.mixpanel = mixpanel;
            this.log = log;
        }

        logError(callback) {
            const log = this.log;
            return function (err) {
                if (err) {
                    log.error(err);
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

            const args = [properties, this.logError(callback)];

            if (this.mixpanel.identify) {
                this.log.debug('using browser client')
                this.mixpanel.identify(id);
                this.mixpanel.people.set(properties, this.logError(callback));
            } else {
                this.mixpanel.people.set(id, properties, this.logError(callback));
            }
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

        increment(id, eventName, amount, callback) {
            if (typeof(amount) === 'function') {
                callback = amount;
                amount = 1;
            }

            if (!id) {
                throw new Error('Missing Distinct Id for user');
            }

            if (!this.mixpanel) {
                callback && callback();
                return;
            }

            this.mixpanel.people.increment(id, eventName, amount, this.logError(callback))
        }

        trackCharge(id, amount, callback) {
            if (!id) {
                throw new Error('Missing Distinct Id for user');
            }

            if (!this.mixpanel) {
                callback && callback();
                return;
            }

            this.mixpanel.people.track_charge(id, amount, this.logError(callback));
        }
    }

module.exports = Tracker;