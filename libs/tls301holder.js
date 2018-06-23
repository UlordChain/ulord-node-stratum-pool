var http = require('http');

module.exports = function (){
    var server = http.createServer(function (req, res) {
        res.writeHead(301, {'Location': 'https://u2pool.org'});
        res.end();
    });
    server.listen(8081);
}
