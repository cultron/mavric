'use strict';

const chalk = require('chalk');

class QueryHelper {
    constructor(
        /** Log */log,
        /** Sequelize */sequelize,
        /** TransactionProvider */txProvider,
        /** Schema */schema,
        /** Sql */sql) {
        this.log = log;
        this.sequelize = sequelize;
        this.txProvider = txProvider;
        this.sql = sql;
        this.schema = schema;
    }

    getCurrentTransaction() {
        return this.txProvider.get();
    }

    runRawQuery(queryText, options, callback) {
        if (typeof(options) === 'function') {
            callback = options;
            options = {
                transaction: this.getCurrentTransaction()
            };
        }

        var query = this.sequelize.query(queryText, options);
        this.runQueryPromise(query, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, result && result[0]);
        });
    }

    runQueryPromise(promise, callback, returnValue) {
        var log = this.log;
        promise
            .then(function (result) {
                callback(null, returnValue || result);
            })
            .catch(function (err) {
                log.error(chalk.red('SQL error'), err);
                callback(err);
            });
    }
}

module.exports = QueryHelper;
