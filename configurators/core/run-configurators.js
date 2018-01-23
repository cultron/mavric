'use strict';

const async = require('async');

module.exports = (configurators, container, callback) => {
    async.eachSeries(configurators, (configure, next) => {
        configure(container, next);
    }, callback);
};