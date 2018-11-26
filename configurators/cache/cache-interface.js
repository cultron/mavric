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
        this.get(key, (err, item) => {
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
        this.client.set(key, value, 'EX', ttl, this.wrappedCallback(callback));
    }

    setObject(key, value, ttl, callback) {
        if (typeof(ttl) === 'function') {
            callback = ttl;
            ttl = null;
        }

        try {
            this.set(key, JSON.stringify(value), ttl, this.wrappedCallback(callback));
        } catch (e) {
            this.wrappedCallback(callback)(e);
        }
    }

    setHash(name, field, value, callback) {
        this.client.hset(name, field, value, this.wrappedCallback(callback));
    }

    getHash(name, field, callback) {
        this.client.hget(name, field, this.wrappedCallback(callback));
    }

    deleteHash(name, field, callback) {
        this.client.hdel(name, field, this.wrappedCallback(callback));
    }
}

module.exports = CacheInterface;
