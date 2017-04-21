'use strict';

class TransactionProvider {
    constructor() {
        this.tx = null;
    }

    get() {
        return this.tx;
    }

    set(t) {
        this.tx = t;
    }

    unset() {
        this.tx = null;
    }
}

module.exports = TransactionProvider;
