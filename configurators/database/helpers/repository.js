'use strict';

const QueryStream = require('pg-query-stream');

class Repository {
 constructor(modelName, queryHelper) {
    this.model = queryHelper.sequelize.models[modelName];
    this.modelName = modelName;
    if (!this.model) {
        throw new Error('Model "' + modelName + '" does not exist');
    }

    this.sequelize = queryHelper.sequelize;
    this.models = queryHelper.sequelize.models;
    this.log = queryHelper.log;
    this.queryHelper = queryHelper;
    this.sql = queryHelper.sql;
    this.schema = queryHelper.schema;
    this.queryInterface = queryHelper.sequelize.getQueryInterface();
}

    getCount(callback) {
        var query = this.model.count(this.getQueryOptions());
        this.runQueryPromise(query, callback);
    }

    runQueryPromise(promise, callback, returnValue) {
        this.queryHelper.runQueryPromise(promise, callback, returnValue);
    }

    runRawQuery(queryText, options, callback) {
        this.queryHelper.runRawQuery(queryText, options, callback);
    }

    getQueryOptions(options) {
        options = options || {};
        options.transaction = options.transaction || this.queryHelper.getCurrentTransaction();
        return options;
    }

    getConnection(callback) {
        var log = this.log,
            connectionManager = this.sequelize.connectionManager;
        connectionManager.getConnection()
            .then(function (client) {
                log.debug('acquired manual connection from sequelize connection manager');
                callback(null, client, function () {
                    log.debug('releasing connection manually');
                    connectionManager.releaseConnection(client);
                });
            })
            .catch(function (err) {
                log.error('Failed to acquired connection manually from sequelize', err);
                callback(err);
            });
    }

    createQueryStream(client, queryText) {
        return client.query(new QueryStream(queryText));
    }

    build(data, noVerify) {
        data = data || {};
        return this.model.build(data);
    }

    create(data, noVerify) {
        return this.build(data, noVerify);
    }

    getInclusions(include) {
        var models = this.models,
            self = this;
        return (include || []).map(function (data) {
            if (typeof(data) === 'string') {
                return models[data];
            }

            data.model = models[data.model];
            if (data.include) {
                data.include = self.getInclusions(data.include);
            }
            return data;
        });
    }

    findById(id, options, callback) {
        if (typeof(options) === 'function') {
            callback = options;
            options = {};
        }

        var include = this.getInclusions(options.include);
        var query = this.model.find(this.getQueryOptions({
            where: {
                id: id,
            },
            include: include
        }));

        this.runQueryPromise(query, callback);
    }

    findAll(options, callback) {
        if (typeof(options) === 'function') {
            callback = options;
            options = {};
        }


        var include = this.getInclusions(options.include),
            query = this.model.findAll(this.getQueryOptions({
                include: include
            }));

        this.runQueryPromise(query, callback);
    }

    save(entity, columns, callback) {
        if (typeof(columns) === 'function') {
            callback = columns;
            columns = null;
        }

        if (entity.isNewRecord) {
            if ('createdBy' in entity) {
                entity.createdBy = this.loggedInUser.id;
                entity.created_by = this.loggedInUser.id;
            }
        } else {
            if ('updatedBy' in entity) {
                entity.updatedBy = this.loggedInUser.id;
            }
        }

        var options = this.getQueryOptions({
            fields: columns
        });
        this.runQueryPromise(entity.save(options), callback);
    }

    del(entity, callback) {
        this.runQueryPromise(entity.destroy(this.getQueryOptions()), callback);
    }

    bulkCreate(values, options, callback) {
        if (typeof(options) === 'function') {
            callback = options;
            options = null;
        }
        this.runQueryPromise(this.model.bulkCreate(values, this.getQueryOptions(options)), callback);
    }

    escape(str) {
        return this.queryInterface.escape(str);
    }

    escapeWildcards(str, escapeChar) {
        return str.replace(/[_%]/g, function (c) {
            return escapeChar + c;
        });
    }

    quote(str) {
        return this.queryInterface.quoteIdentifier(str);
    }
}

module.exports = Repository;
