'use strict';
const successCode = require('./http-response');
const httpRequester = require('./http-requester');

class HttpInterface {
    constructor(log, baseUrl, tracker) {
        this.log = log;
        this.baseUrl = baseUrl;
        this.httpRequester = httpRequester;
        this.tracker = tracker;
        this.vendorName = 'HttpInterface';
    }
    request(options, callback) {
        let method = options.method;
        let url = this.baseUrl + '/' + options.uri,
            qs = options.qs || {},
            json = options.json,
            headers = options.headers || null;

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
                    body: response.body
                });
            } else {
                let data;
                try {
                    if (typeof(response.body) === 'string') {
                        data = JSON.parse(response.body);
                    }
                } catch (e) {
                    data = response.body;
                }
                callback(null, data);
            }
        };

        if (json) {
            this.httpRequester.sendJson(method, url, headers, qs, json, handleResponse);
        } else {
            this.httpRequester.send(method, url, headers, qs, null, null, handleResponse);
        }
    }
}

module.exports = HttpInterface;
