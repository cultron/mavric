//All core configurators
const Database = require('./configurators/database');
const Core = require('./configurators/core');
const Cache = require('./configurators/cache');
const HttpServer = require('./configurators/http-server');
const Tracker = require('./configurators/tracker');

module.exports = {
    Configurator: {
        Core: Core.Configurator,
        Tracker: Tracker.Configurator,
        Cache: Cache.Configurator,
        Database: Database.Configurator,
        HttpServer: HttpServer.Configurator
    },
    Database: Database,
    HttpServer: HttpServer,
    Core: Core,
    Tracker: Tracker.Tracker
};
