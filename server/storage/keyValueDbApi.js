var Promise = /** @type Promise */ require('bluebird');

/**
 * @param {LevelUP} db
 * @param {string} key
 * @returns {Promise.<string | number>}
 */
exports.getValue = function (db, key) {
    return new Promise((resolve, reject) => {
        db.get(key, getValueProcessing.bind(null, resolve, reject, key));
    });
};

/**
 * @param {Function} resolve
 * @param {Function} reject
 * @param {string} key
 * @param {Error | null} error
 * @param {string | number} value
 */
function getValueProcessing(resolve, reject, key, error, value) {
    if (error) {
        if (error.notFound) {
            value = null;
        } else {
            console.error('Error is occurred when getting value for key "' + key + '": ' + error);
            reject(error);
            return;
        }
    }

    resolve(value);
}

/**
 * @param {LevelUP} db
 * @param {string} key
 * @param {string | number} value
 * @returns {Promise}
 */
exports.putValue = function (db, key, value) {
    return new Promise((resolve, reject) => {
        db.put(key, value, putValueProcessing.bind(null, resolve, reject, key, value));
    });
};

/**
 * @param {Function} resolve
 * @param {Function} reject
 * @param {string} key
 * @param {string | number} value
 * @param {Object | null} error
 */
function putValueProcessing(resolve, reject, key, value, error) {
    if (error) {
        console.error('Error is occurred when putting value "' + value + '" for key "' + key + '": ' + error);
        reject(error);
        return;
    }

    resolve(null);
}
