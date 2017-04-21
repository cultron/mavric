'use strict';

const async = require('async');
const lifetime = require('sahara').lifetime;
const QueryHelper = require('./helpers/query-helper');
const TransactionProvider = require('./helpers/transaction-provider');
const Transactor = require('./helpers/transactor');
const Sequelize = require('sequelize');

const configurator = (container, callback) => {
    container.registerType(QueryHelper, 'QueryHelper');
    container.registerType(TransactionProvider, 'TransactionProvider', lifetime.memory());
    //http://docs.sequelizejs.com/en/latest/docs/transactions/#isolation-levels
    const isolationLevels = Sequelize.Transaction.ISOLATION_LEVELS;
    container
        .registerType(Transactor)
        .registerInstance(isolationLevels, 'IsolationLevels')
        .registerInstance(isolationLevels.REPEATABLE_READ, 'DefaultIsolationLevel');

    const configurators = [
        require('./connection/sequelize')
    ];

    async.eachSeries(configurators, (configurator, next) => {
        configurator(container, next);
    }, callback);
};

module.exports = {
    Configurator: configurator,
    Sql: require('sql'),
    Orm: require('sequelize'),
    EntityDefinition: require('./helpers/entity-definition'),
    Repository: require('./helpers/repository'),
    Validators: require('./helpers/validators')
};