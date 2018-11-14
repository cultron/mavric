'use strict';

const httpStatus = require('http-status');
const joi = require('joi');

class BaseController {
    constructor(
        /** ControllerContext */context,
        /** goa */goa
    ) {
        this.goa = goa;
        this.request = context && context.req;
        this.response = context && context.res;
        this.log = context && context.log;
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

    xml(xml, status) {
        this.send(this.goa.action(xml, 'application/xml', status || 200));
    }

    json(json, status) {
        //console.log('got to the json function', this.goa.json, this.send);
        this.response.set('Content-Type', 'application/json');
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
        const invokeMethod = (handler, values) => {
            const method = handler[params.method];
            if (!method || typeof(method) !== 'function') {
                this.handleUnknownAction(params, send);
                return;
            }

            //parse function signature
            const signatureMatch = /.+?\((.*?)\)/.exec(method.toString());
            if (!signatureMatch) {
                this.log.error(`Failed to parse signature for method ${methodName}`);
                this.sendError('Internal error, sorry.');
                return;
            }

            const argNames = signatureMatch[1].split(',').map((value) => value.trim());

            const defaultArgs = {
                data: values,
                callback: (err, result) => {
                    if (err) {
                        this.json(err, 500);
                        return;
                    }

                    this.json(result, 200);
                }
            };

            const args = argNames.map(function(argName) {
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

        this.validate(params, (err, values) => {
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

    validate(params, callback) {
        const inputs = params.inputs || {};
        const values = Object.keys(inputs).reduce((values, key) => {
            values[key] = params[key];
            return values;
        }, {});

        joi.validate(values, joi.object().keys(inputs), callback);
    }
}

module.exports = BaseController;
