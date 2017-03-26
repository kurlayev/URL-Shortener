var url = require('url');
var sendHttpStatus = require('./utils').sendHttpStatus;
var storage = require('../storage/storage');

/**
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
exports.redirect = function (request, response) {
    if (request.method != 'GET') {
        sendHttpStatus(response, 405);
        return;
    }

    var shortPath = url.parse(request.url).pathname.substring(1);
    console.log('ShortPath = ' + shortPath);

    storage.getFullUrl(shortPath)
        .then(doRedirection.bind(null, response))
        .catch((error) => sendHttpStatus(response, 500));
};

/**
 * @param {ServerResponse} response
 * @param {string} fullUrl
 */
function doRedirection(response, fullUrl) {
    if (!fullUrl) {
        console.log('... does not have a corresponding full URL.');
        response.writeHead(404);
        response.write('This shortened URL can not be resolved to any correct URL.');
        response.end();
        return;
    }

    console.log('... was redirected to ' + fullUrl);
    response.writeHead(302, { 'Location': fullUrl });
    response.end();
}
