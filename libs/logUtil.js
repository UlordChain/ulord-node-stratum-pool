var fs = require('fs');
var dateFormat = require('dateformat');
var colors = require('colors');

JSON.minify = JSON.minify || require("node-json-minify");

var severityToColor = function(severity, text) {
    switch(severity) {
        case 'special':
            return text.cyan.underline;
        case 'debug':
            return text.green;
        case 'warning':
            return text.yellow;
        case 'error':
            return text.red;
        default:
            console.log("Unknown severity " + severity);
            return text.italic;
    }
};

var severityValues = {
    'debug': 1,
    'warning': 2,
    'error': 3,
    'special': 4
};

var conflog = JSON.parse(JSON.minify(fs.readFileSync("./config.json", {encoding: 'utf8'})));
var logDir = conflog.logging.files.directory;


if (!fs.existsSync(logDir)){
    try {
        fs.mkdirSync(logDir);
    }
    catch(e){
        throw e;
    }
}

var pendingWrites = {};

setInterval(function(){
    for (var fileName in pendingWrites){
        var data = pendingWrites[fileName];
        fs.appendFileSync(fileName, data);
        delete pendingWrites[fileName];
    }
}, conflog.logging.files.flushInterval * 1000);

var PoolInfoLog = function (severity ,system, text, component, dateentry) {
    var fileName = logDir + '/' + system + '_' + severity + '.log';
    var fileLine = dateentry + ' ['+ system +'] ' + '['+ component +'] - ' + text + '\n';
    pendingWrites[fileName] = (pendingWrites[fileName] || '') + fileLine;
}

var PoolLogger = function (configuration) {


    var logLevelInt = severityValues[configuration.logLevel];
    var logColors = configuration.logColors;



    var log = function(severity, system, component, text, subcat) {

        if (severityValues[severity] < logLevelInt) return;

        if (subcat){
            var realText = subcat;
            var realSubCat = text;
            text = realText;
            subcat = realSubCat;
        }
        var dateentry = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
        var entryDesc = dateentry + ' [' + system + ']\t';
        if (logColors) {
            entryDesc = severityToColor(severity, entryDesc);

            var logString =
                    entryDesc +
                    ('[' + component + '] ').italic;

            if (subcat)
                logString += ('(' + subcat + ') ').bold.grey;

            logString += text.grey;
        }
        else {
            var logString =
                    entryDesc +
                    '[' + component + '] ';

            if (subcat)
                logString += '(' + subcat + ') ';

            logString += text;
        }
		
        if(conflog.logging.auth)
		    PoolInfoLog(severity ,system, text, component, dateentry);
        
        console.log(logString);


    };

    // public

    var _this = this;
    Object.keys(severityValues).forEach(function(logType){
        _this[logType] = function(){
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(logType);
            log.apply(this, args);
        };
    });
};

module.exports = PoolLogger;