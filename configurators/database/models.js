var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    EntityDefinition = require('./helpers/entity-definition'),
    lifetime = require('sahara').lifetime,
    sql = require('sql');

function createModel(table, callback) {
    if (!table.name) {
        callback(new Error('No table name is defined'));
        return;
    }

    if (!table.columns) {
        callback(new Error('No table columns are defined'));
        return;
    }

    var model = new EntityDefinition(table.name).withDefaults();

    table.columns.forEach(function(column) {
        if (!column.name) {
            callback(new Error('Table column name is not defined'));
            return;
        }

        if (!column.options) {
            callback(new Error('Table column options is not defined'));
            return;
        }
        model.set(column.name, column.options);
    });

    table.methods.forEach(function(method) {
        model.addMethod(method.name, method.action);
    });

    callback(null, model);
}

module.exports = function(container, callback) {
    var configurators = [
        require('./connection/sequelize')
    ];
    async.eachSeries(configurators, function(configurator, next) {
        configurator(container, next);
    }, function() {
        var sequelize = container.resolveSync('Sequelize'),
            config = container.resolveSync('Config'),
            definitionsDir = path.join(__dirname,'definitions'),
            models = {};

        fs.readdir(definitionsDir, function(err, files) {
            if (err) {
                callback(err);
                return;
            }

            try {
                files
                    .filter(function(filename) {
                        return /\.js$/.test(filename);
                    })
                    .forEach(function(filename) {
                        var table = require(path.join(definitionsDir, filename));
                        createModel(table, function(err, model) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            container.registerInstance(model, table.name);
                            models[model.name] = model.toEntity(sequelize, config.postgres.schema);
                            models[model.name].Sequelize = sequelize;
                        });

                    });

                // register the schema
                var dialect = new sql.Sql('postgres');
                    //schema = require('../db/schema')(dialect);

                container
                    .registerInstance(models, 'Models', lifetime.memory())
                    //.registerInstance(schema, 'Schema', lifetime.memory())
                    .registerInstance(dialect, 'Sql', lifetime.memory());

                callback();
            } catch (err) {
                callback(err);
            }
        });
    });
};
