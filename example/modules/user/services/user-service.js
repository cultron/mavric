class UserService{
    index(callback) {
        callback(null, 'here')
    }
    list(callback) {
        callback(null, [])
    }

    get(id, callback) {
        callback(null, { id: id });
    }

    update(id, data, callback) {
        callback(null, {});
    }
}

module.exports = UserService;
