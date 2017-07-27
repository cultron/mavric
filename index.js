//All core configurators
const Database = require('./configurators/database');
const Cache = require('./configurators/cache');
const HttpController = require('./configurators/http-controller');
const Helper = require('./configurators/helpers');

module.exports = {
    Configurator: {
        Helper: Helper.Configurator,
        Tracker: require('./configurators/tracker'),
        HttpController: HttpController.Configurator,
        Database: Database.Configurator,
        Cache: Cache
    },
    HttpServer: require('./configurators/http-server'),
    Database: Database,
    HttpController: HttpController,
    Helper: Helper
};
