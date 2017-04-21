function Transactor(/** Sequelize */sequelize,
                    /** Log */log,
                    /** DefaultIsolationLevel */isolationLevel,
                    /** TransactionProvider */txProvider) {
    this.sequelize = sequelize;
    this.log = log;
    this.txProvider = txProvider;
    this.isolationLevel = isolationLevel;
}

Transactor.prototype = {
    transact: function (thunk, options, callback) {
        if (typeof(options) === 'function') {
            callback = options;
            options = null;
        }

        options = options || {};
        if (!options.isolationLevel) {
            options.isolationLevel = this.isolationLevel;
        }

        var log = this.log,
            txProvider = this.txProvider;

        function andFinally() {
            txProvider.unset();
            callback.apply(null, arguments);
        }

        this.sequelize.transaction(options)
            .then(function (t) {
                txProvider.set(t);

                thunk(t, function (err, result) {
                    if (err) {
                        log.error(err);
                        t.rollback()
                            .then(function () {
                                log.warn('Successfully rolled back transaction');
                                andFinally(err);
                            })
                            .catch(function (rollbackErr) {
                                log.error('Error rolling back transaction:', rollbackErr);
                                andFinally(err);
                            });
                        return;
                    }

                    var args = arguments;

                    t.commit()
                        .then(function () {
                            andFinally.apply(null, args);
                        })
                        .catch(function (err) {
                            log.error('Error committing transaction:', err);
                            andFinally(err);
                        });
                });
            })
            .catch(function (err) {
                log.error('Failed to start transaction', err);
                andFinally(err);
            });
    }
};

module.exports = Transactor;
