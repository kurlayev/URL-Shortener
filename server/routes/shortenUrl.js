var url = require('url');
var base58 = require('base58');
var sendHttpStatus = require('./utils').sendHttpStatus;
var responseWithError = require('./utils').responseWithError;
var responseJson = require('./utils').responseJson;
var storage = require('../storage/storage');

/**
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
exports.shortenUrl = function (request, response) {
    if (request.method != 'POST') {
        sendHttpStatus(response, 405);
        return;
    }

    var body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', () => parseIncomingData(response, body));
};

/**
 *
 * @param {ServerResponse} response
 * @param {string} requestBody
 */
function parseIncomingData(response, requestBody) {
    try {
        var data = JSON.parse(requestBody);
        processFullUrl(response, data.fullUrl);
    } catch (error) {
        console.error('Error: ' + error.message);
        responseWithError(response, 'Server got incorrect JSON from client.');
    }
}

/**
 * @param {ServerResponse} response
 * @param {string} fullUrl
 */
function processFullUrl(response, fullUrl) {
    console.log('fullUrl = ' + fullUrl);
    var urlObject = url.parse(fullUrl);

    if (urlObject.protocol != 'http:' && urlObject.protocol != 'https:') {
        responseWithError(response, 'The URL to be shortened should use "http" or "https" protocol only.');
        return;
    }

    storage.getShortPath(fullUrl)
        .then(processShortPath.bind(null, response, fullUrl))
        .catch(() => responseWithError(response, 'The error is occurred while reading from DB.'));
}

/**
 * @param {ServerResponse} response
 * @param {string} fullUrl
 * @param {string} shortPath
 */
function processShortPath(response, fullUrl, shortPath) {
    if (shortPath) {
        var data = { shortPath: shortPath };
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end();
        return;
    }

    var ctx = {
        response:  response,
        fullUrl:   fullUrl,
        shortPath: null
    };

    // Create new shortPath
    storage.getIncrementedCounter()
        .then(createShortPath)
        .then(saveShortPath.bind(null, ctx))
        .then(responseWithShortPath.bind(null, ctx))
        .catch(() => responseWithError(response, 'The shortened URL could not be created due to a server error.'));
}

/**
 * @param {number} counter
 * @returns {string}
 */
function createShortPath(counter) {
    return base58.encode(counter);
}

/**
 * @param {Object} ctx
 * @param {string} shortPath
 * @returns {Promise.<boolean>}
 */
function saveShortPath(ctx, shortPath) {
    ctx.shortPath = shortPath;
    return storage.saveNewShortPath(ctx.fullUrl, shortPath);
}

/**
 * @param {Object} ctx
 * @param {boolean} savingStatus
 */
function responseWithShortPath(ctx, savingStatus) {
    if (savingStatus === true) {
        var data = { shortPath: ctx.shortPath };
        responseJson(ctx.response, data);
    } else {
        responseWithError(ctx.response, 'The created shortPath can not be persisted on database.');
    }
}
