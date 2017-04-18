var chalk = require('chalk'),
    extend = require('extend');

module.exports = function(container, callback) {
    var log = container.resolveSync('Log');

    function logError(callback) {
        return function(err) {
            if (err) {
                log.error('Mixpanel error', err);
            }

            callback && callback(err);
        };
    }

    function Tracker(/** ClientIpAddress */ip,
                     /** Mixpanel */mixpanel,
                     /** AppName */appName) {
        this.mixpanel = mixpanel;
        this.ip = ip;
        this.appName = appName;
    }

    Tracker.prototype = {
        track: function(event, properties, callback) {
            this.trackFor(this.user || {}, event, properties, callback);
        },

        trackFor: function(user, event, properties, callback) {
            if (typeof(properties) === 'function') {
                callback = properties;
                properties = {};
            }

            log.debug('tracking event [' + chalk.yellow(event) + ']' +
                (user.id ? ' (' + chalk.blue(user.email || user.id) + ')' : ''), properties);

            if (!this.mixpanel) {
                callback && callback();
                return;
            }

            var clonedProperties = extend({}, properties);
            clonedProperties.appName = this.appName;
            clonedProperties.ip = this.ip || 0;

            if (user.id) {
                clonedProperties.distinct_id = user.id;
                if (user.email) {
                    clonedProperties.user = user.email;
                }
            }
            if (this.tenant && !clonedProperties.tenant) {
                clonedProperties.tenant = this.tenant.name;
            }

            this.mixpanel.track(event, clonedProperties, logError(callback));
        },

        set: function(properties, callback) {
            this.setFor(this.user || {}, properties, callback);
        },

        setFor: function(user, properties, callback) {
            log.debug('setting properties for ' + chalk.blue(user.email || user.id), properties);
            if (!user.id || !this.mixpanel) {
                callback && callback();
                return;
            }

            var clonedProperties = extend({}, properties);
            if (user.firstName) {
                clonedProperties.$name = user.firstName + ' ' + user.lastName;
            }

            clonedProperties.$created = user.createdAt;
            clonedProperties.$email = user.email || null;

            //must be "ip" not "$ip"
            clonedProperties.ip = this.ip || 0;

            this.mixpanel.people.set(user.id, clonedProperties, logError(callback));
        }
    };

    container
        .registerType(Tracker);

    callback();
};
