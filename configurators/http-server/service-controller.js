'use strict';

const BaseController = require('./base-controller');

class ServiceController extends BaseController {
    constructor(
        /** ControllerContext */context,
        /** goa */goa) {
        super(context, goa);
        this.container = context && context.req && context.req.container;
    }

    getHandler(params, callback) {
        const serviceName = params.service;
        if (!serviceName) {
            callback(new Error('No "service" param was specified'));
            return;
        }

        if (!this.container) {
            callback(new Error('No container found on controller'));
            return;
        }

        this.container.resolve(serviceName + 'Service', callback);
    }
}

module.exports = ServiceController;