var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var compress = require('compression');

var Api = require('./apiEx.js');


var web = module.exports = function(logger){
	var portalConfig = JSON.parse(process.env.portalConfig);
    var poolConfigs = JSON.parse(process.env.pools);
    var websiteConfig = portalConfig.website;
	var app = express();
	var logSystem = 'Website';
	var apiObj = new Api(logger);
	app.all('*',function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
		res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
		if (req.method == 'OPTIONS') {
			res.send(200); /*让options请求快速返回*/
		} else {
			next();
		}
	});
	app.get('/api/:method', function(req, res, next){
		apiObj.handleApiRequest(req, res, next);
	});
	app.use(bodyParser.json());
	app.use(compress());
	app.use('/', express.static('web/'));
	app.get('/*', function (req, res) {
  		res.sendFile(path.join(__dirname, '../web', 'index.html'));
	});
	app.listen(portalConfig.website.port, portalConfig.website.host, function () {
            logger.debug(logSystem, 'Server', 'Website thread started on ' + portalConfig.website.host + ':' + portalConfig.website.port);
          });
}
