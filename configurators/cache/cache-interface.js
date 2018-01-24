const chalk = require('chalk');

class CacheInterface {
    constructor(name, client, log) {
        this.name = name;
        this.client = client;
        this.log = log;
    }

    delete(key, callback) {
        this.client.del(key, this.wrappedCallback(callback));
    }

    get(key, callback) {
        this.client.get(key, this.wrappedCallback(callback));
    }

    getObject(key, callback) {
        return this.get(key, (err, item) => {
            if (err) {
                this.wrappedCallback(callback)(err);
                return;
            }

            if (!item) {
                callback();
                return;
            }

            if (item) {
                try {
                    item = JSON.parse(item);
                    callback(err, item);
                } catch (e) {
                    this.log.error(`${this.name} error:`, e);
                    callback(e, item);
                }

                return;
            }
        });
    }

    wrappedCallback(callback) {
        const self = this;
        return function(err) {
            err && self.log.error(`${self.name} error:`, err);
            callback && callback.apply(null, arguments);
        };
    }

    set(key, value, ttl, callback) {
        if (typeof(ttl) === 'function') {
            callback = ttl;
            ttl = null;
        }

        if (typeof(ttl) === 'number') {
            ttl = parseInt(ttl);
        } else if (ttl instanceof Date) {
            ttl = (ttl.getTime() - Date.now()) / 1000;
        } else {
            ttl = null;
        }

        ttl = ttl || 86400;
        if (ttl <= 0) {
            callback && callback(new Error('Invalid expiry, must be in the future'));
            return;
        }

        this.log.debug('setting cache value at ' + chalk.cyan(key) + ' with TTL ' + chalk.yellow(ttl.toString()));
        this.client.set(key, ttl, value, this.wrappedCallback(callback));
    }

    setObject(key, value, ttl, callback) {
        if (typeof(ttl) === 'function') {
            callback = ttl;
            ttl = null;
        }
        const args = [
            key,
            JSON.stringify(value),
            ttl,
            this.wrappedCallback(callback)
        ];
        try {
            this.set.apply(this, args);
        } catch (e) {
            this.wrappedCallback(callback)(e);
        }
    }

}

module.exports = CacheInterface;