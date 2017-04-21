'use strict';

const Sequelize = require('sequelize');
const inflection = require('inflection');
const cleanJson = require('./clean-json');
const extend = require('extend');

class EntityDefinition {
    constructor(name, table) {
        this.properties = {};
        this.name = name;
        this.table = table || inflection.underscore(name);
        this.hooks = {};
        this.methods = {};
        this.indexes = [];
        this.toRemoveFromJSON = [];
        this.getters = {};
        this.setters = {};
    }

    withDefaults(noCreatedBy) {
        this
            .set('createdAt', {type: Sequelize.DATE, field: 'created_at'})
            .set('updatedAt', {type: Sequelize.DATE, field: 'updated_at', allowNull: true})
            .addHook('beforeCreate', (entity, options, callback) => {
                if (!entity.createdAt) {
                    entity.createdAt = new Date();
                }

                callback();
            })
            .addHook('beforeUpdate', (entity, options, callback) => {
                entity.updatedAt = new Date();
                callback();
            })
            .addHook('beforeBulkCreate', (entities, options, callback) => {
                entities.forEach((entity) => {
                    if (!entity.createdAt) {
                        entity.createdAt = new Date();
                    }
                });
                callback();
            });

        if (!noCreatedBy) {
            this.set('createdBy', {type: Sequelize.INTEGER, field: 'created_by', allowNull: true});
            this.removeFromJSON('password');
        }

        return this;
    }

    set(name, value) {
        this.properties[name] = value;
        return this;
    }

    getter(name, func) {
        this.getters[name] = func;
        return this;
    }

    setter(name, func) {
        this.setters[name] = func;
        return this;
    }

    addHook(type, hook) {
        if (!this.hooks[type]) {
            this.hooks[type] = [];
        }

        this.hooks[type].push(hook);
        return this;
    }

    addMethod(name, method) {
        this.methods[name] = method;
        return this;
    }

    addIndex(options) {
        this.indexes.push(options);
        return this;
    }

    toEntity(sequelize, schema) {
        var self = this;
        var options = {
            timestamps: false,
            freezeTableName: true,
            schema: schema,
            tableName: this.table,
            underscored: true,
            instanceMethods: {},
            indexes: this.indexes
        };

        //de-reference this.methods
        Object.keys(this.methods).forEach((name) => {
            options.instanceMethods[name] = self.methods[name];
        });

        options.getterMethods = this.getters;
        options.setterMethods = this.setters;

        options.instanceMethods.toJSON = () => {
            var json = this.constructor.super_.prototype.toJSON.apply(this, arguments);
            return cleanJson(json, self.toRemoveFromJSON);
        };

        options.instanceMethods.duplicate = (data, build) => {
            if (typeof(data) === 'boolean' && typeof(build) === 'undefined') {
                build = data;
                data = {};
            }

            var other = extend(true, {}, this.toFullJSON(), data);
            delete other.id;
            delete other.createdAt;
            delete other.updatedAt;

            if (build) {
                other = this.entity().build(other);
            }

            return other;
        };

        options.instanceMethods.entity = () => {
            return Entity;
        };

        options.instanceMethods.toFullJSON = () => {
            return this.constructor.super_.prototype.toJSON.apply(this, arguments);
        };

        var Entity = sequelize.define(this.name, this.properties, options);

        Object.keys(this.hooks).forEach((type) => {
            self.hooks[type].forEach((fn) => {
                Entity.hook(type, fn);
            });
        });

        return Entity;
    }

    removeFromJSON(field) {
        this.toRemoveFromJSON.push(field);
        return this;
    }
}


module.exports = EntityDefinition;
