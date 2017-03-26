var Promise = /** @type Promise */ require('bluebird');
var levelup = require('levelup');
var dbApi = require('./keyValueDbApi');

var counter = -1;
const COUNTER_KEY = '_counter';
/** @type LevelUP */
var db = levelup('./db');

if (db) {
    console.log('The connection to database was opened successfully.');
} else {
    console.log('FATAL ERROR: The connection to database can not be opened!');
    process.exit(1);
}

/**
 * @param {Function} callback
 */
exports.closeDB = function (callback) {
    db.isOpen() ? db.close(closeCallback.bind(null, callback)) : callback();
};

/**
 * @param {Function} callback
 * @param {Error} error
 */
function closeCallback(callback, error) {
    if (error) {
        console.error('Error when closing DB: ' + error);
    } else {
        console.log('The connection to database was closed successfully.');
    }

    callback();
}

/**
 * @returns {Promise.<number>}
 */
exports.getIncrementedCounter = function () {
    if (counter > -1) {
        return Promise.resolve(++counter);
    }

    return dbApi.getValue(db, COUNTER_KEY)
        .then((value) => {
                  console.log('The old counter value: ' + value);
                  counter = value == null ? -1 : +value;
                  return ++counter;
              });
};

/**
 * @param {string} fullUrl
 * @returns {Promise.<string>}
 */
exports.getShortPath = function (fullUrl) {
    return dbApi.getValue(db, getFullUrlAsKey(fullUrl));
};

/**
 * @param {string} shortPath
 * @returns {Promise.<string>}
 */
exports.getFullUrl = function (shortPath) {
    return dbApi.getValue(db, shortPath);
};

/**
 * @param {string} fullUrl
 * @param {string} shortPath
 * @returns {Promise.<boolean>}
 */
exports.saveNewShortPath = function (fullUrl, shortPath) {
    return new Promise((resolve, reject) => {
        db.batch()
            .put(COUNTER_KEY, counter)
            .put(shortPath, fullUrl)
            .put(getFullUrlAsKey(fullUrl), shortPath)
            .write(saveNewShortPathCallback.bind(null, resolve, reject));
    });
};

/**
 * @param {Function} resolve
 * @param {Function} reject
 * @param {Error} error
 */
function saveNewShortPathCallback(resolve, reject, error) {
    if (error) {
        console.error('Error occurred while saving the new shortPath: ' + error);
        reject(error);
    } else {
        resolve(true);
    }
}

/**
 * @param {string} fullUrl
 * @returns {string}
 */
function getFullUrlAsKey(fullUrl) {
    return '=' + fullUrl;
}