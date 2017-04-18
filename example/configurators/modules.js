/**
 * Boilerplate: This is a basic helper for the Module Controller structure
 *
 * Modules are a mixed Web and Service layer implementation comprised of Controllers, Services, Routes, and Helper libraries/methods
 *
 * The Routes file (routes.js) is the entry point to the Module dictating which Controllers and Services to use.
 *
 * Controllers should extend the Mavric BaseController, but are not required to.  A Generic Service-Controller is provided by default.
 *
 * @type {exports}
 */

const fs = require('fs');
const path = require('path');
const async = require('async');
const joi = require('joi');

module.exports = (container, callback) => {
    const app = container.resolveSync('App');
    const directory = container.resolveSync('directory');
    const modulePath = path.join(__dirname, '..', 'modules');
    const modules = fs.readdirSync(modulePath)
        .filter(file => fs.statSync(path.join(modulePath, file)).isDirectory());

    const submodules = [
            'controllers',
            'routes',
            'services',
            'helpers'
        ];

    const makePath = (name, sub) => {
        return path.resolve(path.join(__dirname, '..', 'modules', name, sub));
    };

    async.eachSeries(submodules, (submodule, next) => {
        async.eachSeries(modules, (module, next) => {
            const modulePath = makePath(module, submodule);

            if (!fs.existsSync(submodule === 'routes' ? modulePath + '.js' : modulePath)) {
                next();
                return;
            }

            if (submodule === 'routes') {
                require(modulePath)(app, joi, next);
            } else {
                directory(modulePath)(container, next);
            }
        }, next);
    }, callback);
};
