'use strict';

const path = require('path');

module.exports = (container, callback) => {
    const log = container.resolveSync('Log');

    function controllerFactory(name, context, callback) {
        const req = context.req;

        const controllerContext = {
            req: context.req,
            res: context.res,
            log: log
        };

        if (!req.container) {
            callback(new Error('req.container does not exist!'));
            return;
        }

        req.container
            .registerInstance(controllerContext, 'ControllerContext')
            .registerInstance(req, 'Request')
            .registerInstance(context.res, 'Response')
            .registerInstance(req.session, 'Session');

        req.container.resolve(name + 'Controller', (err, controller) => {
            if (err) {
                callback(err);
                return;
            }
            //ensure container is on the controller
            controller.container = controller.container || req.container;
            callback(null, controller);
        });
    }

    const config = container.resolveSync('Config');
    const goa = require('goa');

    container
        .registerInstance(controllerFactory, 'ControllerFactory')
        .registerInstance(config.app.port, 'AppPort')
        .registerInstance(goa, 'goa');


    const app = goa(controllerFactory, { defaultAction: config.app.defaultAction });

    container.registerInstance(app, 'App');

    app.enable('trust proxy');
    app.enable('strict routing');
    app.enable('case sensitive routing');

    if (!config.cacheViews) {
        log.debug('disabling view cache');
        app.disable('view cache');
    } else {
        log.debug('enabling view cache');
        app.enable('view cache');
    }

    app.set('views', path.join(container.resolveSync('AppDir'), 'views'));
    app.set('view engine', 'jade');

    app.use(log.middleware.bind(log));
    app.use((req, res, next) => {
        const host = req.hostname;
        const protocol = req.protocol;

        req.container = container.createChildContainer(true)
            .registerInstance(host, 'Host')
            .registerInstance(protocol + '://' + host, 'LinkRoot')
            .registerInstance(req.ip, 'ClientIpAddress');

        next();
    });

    app.use((req, res, next) => {
        res.header('X-Powered-By', 'Mavric');
        next();
    });

    const postLimit = 1024 * 1024;

    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const multipartParser = require('connect-multiparty');

    app.use(cookieParser());
    app.use(bodyParser.json({ limit: postLimit }));
    app.use(bodyParser.urlencoded({ extended: true, limit: postLimit }));
    app.use(multipartParser());

    callback();
};