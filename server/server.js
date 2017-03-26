var http = require('http');
var router = require('./routes/router');
var storage = require('./storage/storage');

const PORT = 3000;

var server = http.createServer(router.route);

server.on('listening', () => console.log("Server has been started on http://localhost:%s", PORT));
server.on('error', serverErrorHandler);
process.on('SIGINT', exitHandler);

server.listen(PORT);

/**
 * @param {Error} error
 */
function serverErrorHandler(error) {
    if (error.code == 'EADDRINUSE') {
        console.error('Server can not be started. Perhaps another instance of server has already been started on port '
                      + PORT + '.');
    } else {
        console.error(error);
    }

    exitHandler();
}

function exitHandler() {
    storage.closeDB(() => process.exit(0));
}