const request = require('request');

class HttpRequester {
    send(method, url, headers, qs, json, form, callback) {
        if (!method || typeof(method) !== 'string') {
            callback(new Error('HttpRequester error - no method provided'));
            return;
        }

        if (!url || typeof(url) !== 'string') {
            callback(new Error('HttpRequester error - no url provided'));
            return;
        }

        const params = {
            method: method,
            url: url,
            headers: headers || {}
        };

        if (qs) {
            params.qs = qs;
        }
        if (json) {
            params.json = json;
        }
        if (form) {
            params.form = form;
        }

        request(params, callback);
    }

    sendJson(method, url, headers, qs, json, callback) {
        if (!json) {
            callback(new Error('HttpRequester error - no json provided'));
            return;
        }

        this.send(method, url, headers, qs, json, null, callback);
    }

    sendForm(method, url, headers, qs, formData, callback) {
        if (!formData) {
            callback(new Error('HttpRequester error - no form data provided'));
            return;
        }

        this.send(method, url, headers, qs, null, formData, callback);
    }
}

module.exports = HttpRequester;
