var path = require('path');
var fs = require('fs');
var sendHttpStatus = require('./utils').sendHttpStatus;

const mapExtensionToMime = {
    '.ico':  'image/x-icon',
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg'
};
const extensionsToBeCached = {
    '.js':  true,
    '.css': true
};
const DEFAULT_MIME_TYPE = 'text/plain';

/**
 * @param {string} resourceName
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
exports.processFileRequest = function (resourceName, request, response) {
    if (request.method != 'GET') {
        sendHttpStatus(response, 405);
        return;
    }

    readAndReturnFile(resourceName, response);
};

/**
 * @param {string} resourceName
 * @param {ServerResponse} response
 */
function readAndReturnFile(resourceName, response) {
    var filename = path.resolve(__dirname, '..', '..', 'frontend', 'public', resourceName);

    var readStream = fs.createReadStream(filename);
    readStream.on('open', setResponseHeaders.bind(null, resourceName, response));
    readStream.on('error', readErrorHandler.bind(null, resourceName, response));
    readStream.on('end', () => console.log(`OK (${resourceName})`));
    readStream.pipe(response);
}

/**
 * @param {string} resourceName
 * @param {ServerResponse} response
 */
function setResponseHeaders(resourceName, response) {
    var extension = path.extname(resourceName);
    var contentType = mapExtensionToMime[extension] || DEFAULT_MIME_TYPE;
    var headers = { 'Content-Type': contentType };
    if (extension in extensionsToBeCached) {
        headers['Cache-Control'] = 'max-age=31536000';
    }
    response.writeHead(200, headers);
}

/**
 * @param {string} resourceName
 * @param {ServerResponse} response
 * @param {Error} error
 */
function readErrorHandler(resourceName, response, error) {
    console.error('Error at reading "' + resourceName + '": ' + error);
    sendHttpStatus(response, error.code == 'ENOENT' ? 404 : 500);
}
