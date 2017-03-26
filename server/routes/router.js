var url = require('url');
var processFileRequest = require('./fileRequest').processFileRequest;
var shortenUrl = require('./shortenUrl').shortenUrl;
var redirect = require('./redirect').redirect;

exports.route = route;

/**
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
function route(request, response) {
    console.log('\n-> ' + (new Date().toISOString().slice(0, -1)) + '  ' + request.url);
    var pathname = url.parse(request.url).pathname;

    if (pathname == '/') {
        processFileRequest('_mainPage.html', request, response);
    } else if (pathname == '/shortenUrl') {
        shortenUrl(request, response);
    } else if (pathname.charAt(1) == '_') {
        processFileRequest(pathname.substring(1), request, response);
    } else {
        redirect(request, response);
    }
}
