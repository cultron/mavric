'use strict';

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    if (!config.log) {
        callback(new Error('No "log" config block'));
        return;
    }

    const Logger = require('looger').Logger;

    /**
     * @name Log
     * @type {Logger}
     * */
    let log = config.log.noop ? Logger.noop : Logger.create(config.log);

    container.registerInstance(log, 'Log');
    callback();
};