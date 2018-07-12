var redis = require('redis');
var fs = require('fs');
JSON.minify = JSON.minify || require("node-json-minify");
var configs = JSON.parse(JSON.minify(fs.readFileSync("config.json", { encoding: 'utf8' })));
var connection = redis.createClient(configs.redis.port, configs.redis.host)
if (configs.redis.password) {
    connection.auth(configs.redis.password)
}


var Moniter = module.exports = function () {
    this.getMoniterInfo = function () {
        return new Promise(function (reject, resolve) {
            connection.hgetall('Moniter', function (err, data) {
                var tcpcontent,tcpsum;
                if (fs.existsSync('./logs/tcptemp.log')) {
                    tcpcontent = fs.readFileSync('./logs/tcptemp.log', { encoding: 'utf8' });
                    tcpsum = tcpcontent.split('\n').reduce(function (total, num) {
                        return total + parseInt(num || 0)
                    }, 0)
                }else {
                    tcpsum = '底层还未返回';
                }

                if (err) {
                    reject(err)
                    return
                }
                if (!data) {
                    resolve({ message: 'error', messageContent: '没有监视对象！' })
                    return
                }
                resolve(Object.assign(data, { tcpsum: tcpsum }));
            })
        })
    }
    this.getMoniterShare = function (address) {
        return new Promise(function (reject, resolve) {
            connection.zrangebyscore(address + '_share', Date.now() - 300000, Date.now(), function (err, data) {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }
    this.getMoniterHash = function (address) {
        return new Promise(function (reject, resolve) {
            connection.zrangebyscore(address + '_hash', Date.now() - 300000, Date.now(), function (err, data) {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }
}