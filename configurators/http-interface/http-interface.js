'use strict';
const successCode = require('./http-response');
const HttpRequester = require('./http-requester');

class HttpInterface {
    constructor(log, baseUrl, tracker) {
        this.log = log;
        this.baseUrl = baseUrl;
        this.httpRequester = new HttpRequester();
        this.tracker = tracker;
        this.vendorName = 'HttpInterface';
    }
    request(options, callback) {
        let method = options.method;
        let baseUrl = options.baseUrl ? options.baseUrl : this.baseUrl;
        let url = baseUrl + '/' + options.uri,
            headers = options.headers,
            qs = options.qs || {},
            json = options.json,
            form = options.form;

        const handleResponse = (err, response) => {
            if (err) {
                this.log.warn(`[${this.vendorName}] `, err);
                this.log.warn(`[${this.vendorName} Request Params] `, options);
                if (this.tracker) {
                    this.tracker.track(`[${this.vendorName} API Error]`, { error: err, requestParams: options });
                }

                callback(err);
            } else if (!successCode(response.statusCode)) {
                this.log.warn(`[${this.vendorName}] received bad status code: ` + response.statusCode, response.body);
                this.log.warn(`[${this.vendorName} Request Params] `, options);
                if (this.tracker) {
                    this.tracker.track(`[${this.vendorName} API Error]`, {
                        error: response.body,
                        statusCode: response.statusCode,
                        requestParams: options
                    });
                }

                callback({
                    status: response.statusCode,
                    headers: response.headers,
                    body: response.body
                });
            } else {
                const data = {
                    status: response.statusCode,
                    headers: response.headers,
                }
                try {
                    data.body = JSON.parse(response.body);
                } catch (e) {
                    data.body = response.body;
                }
                callback(null, data);
            }
        };

        if (json) {
            this.httpRequester.sendJson(method, url, headers, qs, json, handleResponse);
        } else if (form) {
            this.httpRequester.sendForm(method, url, headers, qs, form, handleResponse);
        } else {
            this.httpRequester.send(method, url, headers, qs, null, null, handleResponse);
        }
    }
}

module.exports = HttpInterface;
