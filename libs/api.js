var redis = require('redis');
var async = require('async');
var fs = require('fs');
var md5 = require('md5')
var path = require('path')
var stats = require('./stats.js');

var rigPath = path.resolve(__dirname,'../website/static/downloads/ulordrig.exe');
var rigVersion = path.resolve(__dirname,'../website/static/downloads/ulordrigVersion');
var rigState = {address:"http://testnet-pool.ulord.one/static/downloads/ulordrig.exe",version:'0.2.0',md5:''};
function refreshResult(){
	rigState.address = "http://testnet-pool.ulord.one/static/downloads/ulordrig.exe";

	async.waterfall([
		function(callback){
			fs.readFile(rigPath,function(err,data){
				if(err){
					callback(err)
				}
				rigState.md5 = md5(data).toUpperCase()
				callback(null)
			})
		}
		],function(err,result){})
}

fs.watch(rigPath,refreshResult);
refreshResult();

module.exports = function(logger, portalConfig, poolConfigs){

	var _this = this;

	var portalStats = this.stats = new stats(logger, portalConfig, poolConfigs);

	this.liveStatConnections = {};

	this.handleApiRequest = function(req, res, next){

		switch(req.params.method){
			case 'rig_stats':			
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(rigState));
			return;
			case 'stats':
			res.header('Content-Type', 'application/json');
			res.end(portalStats.statsString);
			return;
			case 'pool_stats':
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(portalStats.statPoolHistory));
			return;
			case 'blocks':
			case 'getblocksstats':
			portalStats.getBlocks(function(data){
				res.header('Content-Type', 'application/json');
				res.end(JSON.stringify(data));                                        
			});
			break;
			case 'payments':
			var poolBlocks = [];
			for(var pool in portalStats.stats.pools) {
				poolBlocks.push({name: pool, pending: portalStats.stats.pools[pool].pending, payments: portalStats.stats.pools[pool].payments});
			}
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(poolBlocks));
			return;
			case 'worker_stats':
			res.header('Content-Type', 'application/json');
			if (req.url.indexOf("?")>0) {
				var url_parms = req.url.split("?");
				if (url_parms.length > 0) {
					var history = {};
					var workers = {};
					var address = url_parms[1] || null;
					//res.end(portalStats.getWorkerStats(address));
					if (address != null && address.length > 0) {
						// make sure it is just the miners address
						address = address.split(".")[0];
						// get miners balance along with worker balances
						portalStats.getBalanceByAddress(address, function(balances) {
							// get current round share total
							portalStats.getTotalSharesByAddress(address, function(shares) {								
								var totalHash = parseFloat(0.0);
								var totalShares = shares;
								var networkSols = 0;
								for (var h in portalStats.statHistory) {
									for(var pool in portalStats.statHistory[h].pools) {
										for(var w in portalStats.statHistory[h].pools[pool].workers){
											if (w.startsWith(address)) {
												if (history[w] == null) {
													history[w] = [];
												}
												if (portalStats.statHistory[h].pools[pool].workers[w].hashrate) {
													history[w].push({time: portalStats.statHistory[h].time, hashrate:portalStats.statHistory[h].pools[pool].workers[w].hashrate});
												}
											}
										}
									}
								}
								for(var pool in portalStats.stats.pools) {
									for(var w in portalStats.stats.pools[pool].workers){
										if (w.startsWith(address)) {
											workers[w] = portalStats.stats.pools[pool].workers[w];
											for (var b in balances.balances) {
												if (w == balances.balances[b].worker) {
													workers[w].paid = balances.balances[b].paid;
													workers[w].balance = balances.balances[b].balance;

												}
											}
											workers[w].balance = (workers[w].balance || 0);
											workers[w].paid = (workers[w].paid || 0);
											totalHash += portalStats.stats.pools[pool].workers[w].hashrate;
											networkSols = portalStats.stats.pools[pool].poolStats.networkSols;
										}
									}
								}
								res.end(JSON.stringify({miner: address, totalHash: totalHash, totalShares: totalShares, networkSols: networkSols, immature: balances.totalImmature, balance: balances.totalHeld, paid: balances.totalPaid, workers: workers, history: history}));
							});
						});
					} else {
						res.end(JSON.stringify({result: "error"}));
					}
				} else {
					res.end(JSON.stringify({result: "error"}));
				}
			} else {
				res.end(JSON.stringify({result: "error"}));
			}
			return;
			case 'live_stats':
			res.connection.setTimeout(0);
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Content-Encoding':'utf8'
			});
			res.write('\n');
			var uid = Math.random().toString();
			_this.liveStatConnections[uid] = res;
			res.flush();
			req.on("close", function() {
				delete _this.liveStatConnections[uid];
			});
			return;
			default:
			next();
		}
	};

	this.handleAdminApiRequest = function(req, res, next){
		switch(req.params.method){
			case 'pools': {
				res.end(JSON.stringify({result: poolConfigs}));
				return;
			}
			default:
			next();
		}
	};

};
