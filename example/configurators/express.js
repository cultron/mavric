var goa = require('goa'),
    path = require('path'),
    multipartParser = require('connect-multiparty'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    async = require('async');

module.exports = function(container, callback) {
    var log = container.resolveSync('Log'),
        config = container.resolveSync('Config');

    //This supports single controller handler abstraction
    function controllerFactory(name, context, callback) {
        var req = context.req;
        req.container
            .registerInstance(context, 'ControllerContext')
            .registerInstance(req, 'Request')
            .registerInstance(context.res, 'Response')
            .registerInstance(req.session, 'Session');

        var controllerName = name + 'Controller';

        req.container.resolve(controllerName, function(err, controller) {
            if (err) {
                callback(err);
                return;
            }
            controller.goa = goa;
            controller.container = req.container;
            callback(null, controller);
        });
    }

    var goaOptions = {
        defaultAction: 'handle'
    };

    var app = goa(controllerFactory, goaOptions);
    container.registerInstance(app, 'App');

    app.enable('trust proxy');
    app.enable('strict routing');
    app.enable('case sensitive routing');

    app.set('views', path.resolve(path.join(__dirname, '../views')));
    app.set('view engine', 'jade');

    app.use(log.middleware.bind(log));

    app.use(function(req, res, next) {
        req.container = container.createChildContainer(true);

        req.container
            .registerInstance(req, 'Request')
            .registerInstance(req.ip, 'ClientIpAddress')
            .registerInstance('', 'LinkRoot')
            .registerInstance(res, 'Response');
        next();
    });

    app.use(function(req, res, next) {
        res.header('X-Powered-By', 'Scowls and Skepticism');
        next();
    });

    /**
     * Load Application Configurators
     * **/
    var configurators = [
        './locals'
    ];

    // per-request configurators
    app.use(function(req, res, next) {
        async.eachSeries(configurators, function(configurator, done) {
            configurator = require(configurator);
            configurator(req.container, done);
        }, next);
    });

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(multipartParser());

    //static files
    var rootDir = path.resolve(__dirname + '/../../../');
    console.log(rootDir)
    app.use('/build', app.express.static(rootDir + '/build'));

    callback();
};
