'use strict';

module.exports = (container, callback) => {
    const log = container.resolveSync('Log');
    const goa = container.resolveSync('goa');

    /**
     * @name ControllerFactory
     */
    function controllerFactory(name, context, callback) {
        var req = context.req;
        const errorMapping = container.resolveSync('ErrorMapping');

        /**
         * @name ControllerContext
         * @type {{req: *, res: *, log: *, errorMapping: *}}
         */
        const controllerContext = {
            req: context.req,
            res: context.res,
            log: log,
            errorMapping: errorMapping
        };

        req.container
            .registerInstance(controllerContext, 'ControllerContext')
            .registerInstance(req, 'Request')
            .registerInstance(context.res, 'Response')
            .registerInstance(req.session, 'Session');

        const controllerName = name + 'Controller';

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

    container.registerInstance(controllerFactory, 'ControllerFactory');
    callback();
};
