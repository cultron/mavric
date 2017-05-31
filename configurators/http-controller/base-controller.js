'use strict';

const httpStatus = require('http-status');
const joi = require('joi');
const x2js = require('../util/xml2json');

class BaseController {
    constructor(/** ControllerContext */context) {
        this.request = context.req;
        this.response = context.res;
        this.log = context.log;
        this.errorMapping = context.errorMapping;
        this.send = function() {
            throw new Error('Controller was misconfigured somehow: send should have been overridden');
        };
    }

    csv(data, filename) {
        if (filename) {
            this.response.set('Content-Disposition', `attachment; filename="${filename}"'`);
        }

        this.send(this.goa.action(data, 'text/csv'));
    }

    text() {
        this.send(this.goa.action.apply(this.goa.action, arguments));
    }

    error(err, status) {
        let error = err;

        if (!error.message) {
            error = this.translateErrors(err);
        }

        status = this.getStatus(status || error.status || 'internal server error');
        this.send(this.goa.json(error, status));
    }

    xml(json, status) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>' + x2js.json2xml_str(json);
        this.send(this.goa.action(xml, 'application/xml', status || 200));
    }

    json(json, status) {
        this.send(this.goa.json(json, status || 200));
    }

    file(filePath) {
        this.send(this.goa.file(filePath));
    }

    redirect(path) {
        this.send(this.goa.redirect(path));
    }

    render(view, context) {
        if (!view) {
            view = this.defaultViewName;
        }

        this.send(this.goa.view(view, context));
    }

    createErrorResponse(err) {
        return this.translateError(err);
    }

    getStatus(friendly) {
        var status = friendly;

        if (typeof(friendly) === 'string') {
            status = httpStatus[friendly.toUpperCase().replace(/ /g, '_')];
        }

        if (typeof(status) !== 'number') {
            throw new Error(`Status ${friendly} is not a valid status!`);
        }

        return status;
    }

    getHandler(params, callback) {
        callback(null, this);
    }

    handle(params, send) {
        this.send = send;

        this.defaultViewName = params.view;

        const invokeMethod = (handler, values) => {
            var method = handler[params.method];
            if (!method || typeof(method) !== 'function') {
                this.handleUnknownAction(params, send);
                return;
            }

            function parseArgs(fn) {
                return (/\(([\s\S]*?)\)/.exec(fn.toString()) || [ '', '' ])[1]
                    .split(',')
                    .map(function(name) {
                        return name.replace(/\/\*\*.*?\*\//, '').trim();
                    });
            }

            var defaultArgs = {
                data: values,
                options: values,
                values: values,
                callback: (err, result) => {
                    //ron is just the worst
                    const responseData = err ? this.createErrorResponse(err) : result;
                    const status = this.getStatus(err ? responseData.status || 'internal server error' : 'ok');
                    if (err && responseData.status) {
                        delete responseData.status;
                    }

                    switch (params.format) {
                        case 'xml':
                            this.xml(responseData, status);
                            break;
                        case 'json':
                        default:
                            this.json(this.serializeObject(responseData), status);
                            break;
                    }
                }
            };

            const args = parseArgs(method).map(function(argName) {
                if (argName in values) {
                    return values[argName];
                }

                if (argName in defaultArgs) {
                    return defaultArgs[argName];
                }

                return null;
            });

            method.apply(handler, args);
        };

        if (params.corsEnabled) {
            this.response.header('Access-Control-Allow-Origin', '*');
            this.response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        }

        const inputs = params.inputs || {};
        const values = Object.keys(inputs).reduce((values, key) => {
            values[key] = params[key];
            return values;
        }, {});

        this.validate(inputs, values, (err, values) => {
            if (err) {
                this.error(err, 400);
                return;
            }

            this.getHandler(params, (err, handler) => {
                if (err) {
                    if (err.handlerNotFound) {
                        this.handleUnknownAction(params, send);
                        return;
                    }

                    this.error(err, 500);
                    return;
                }

                invokeMethod(handler, values);
            });
        });
    }

    serializeObject(item) {
        var json = item;

        function toJSON(item) {
            item = item || {};

            if (typeof(item.toJSON) === 'function') {
                item = item.toJSON();
            }

            return item;
        }

        if (Array.isArray(item)) {
            json = item.map(toJSON);
        } else {
            json = toJSON(item);
        }

        return json;
    }

    handleUnknownAction(params, send) {
        //super lame, but we don't handle 404s intelligently anywhere
        send(this.goa.action('Not Found', 'text/plain', { status: 404 }));
    }

    translateError(err) {
        var self = this,
            error = { messages: [] };

        if (err && typeof(err) === 'object') {
            Object.keys(err).forEach(function(key) {
                var mappedError = self.errorMapping[key] || {
                        message: 'Internal Server Error',
                        status: 'internal server error'
                    };

                error.messages.push(mappedError.message);
                // TODO: probably should be more smart about this
                // also, i hate this
                error.status = mappedError.status;
            });
        }

        return error;
    }

    translateErrors(err) {
        if (Array.isArray(err)) {
            var errors = [];

            errors = err.map((error) => {
                error = this.translateError(error);
                errors.status = error.status;
                delete error.status;
                return error;
            });

            return errors;
        }

        return this.translateError(err);
    }

    validate(inputs, values, callback) {
        joi.validate(values, joi.object().keys(inputs), callback);
    }
}

module.exports = BaseController;
