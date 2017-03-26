/**
 * @param {ServerResponse} response
 * @param {number} statusCode
 */
exports.sendHttpStatus = function (response, statusCode) {
    response.writeHead(statusCode);
    response.end();
};

/**
 * @param {ServerResponse} response
 * @param {string} errorMessage
 */
exports.responseWithError = function (response, errorMessage) {
    var data = { error: errorMessage };
    responseJson(response, data);
};

exports.responseJson = responseJson;

/**
 * @param {ServerResponse} response
 * @param {Object} dataObject
 */
function responseJson(response, dataObject) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(dataObject));
    response.end();
}
