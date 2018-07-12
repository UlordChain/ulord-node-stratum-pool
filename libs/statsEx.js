var redis = require('redis');
var async = require('async');


function rediscreateClient(port, host, pass) {
	var client = redis.createClient(port, host);
	if (pass) {
		client.auth(pass);
	}
	return client;
}
function getReadableNetworkHashRateString(hashrate) {
	var i = 0;
	var hashrate = parseFloat(hashrate);
	var byteUnits = [' H/s', ' KH/s', ' MH/s', ' GH/s', ' TH/s', ' PH/s' ];
	while (hashrate >= 1000){
		hashrate = hashrate / 1000;
		i++;
	}
	return hashrate.toFixed(2) + byteUnits[i];

}

function roundTo(n, digits) {
	if (digits === undefined) {
		digits = 0;
	}
	var multiplicator = Math.pow(10, digits);
	n = parseFloat((n * multiplicator).toFixed(11));
	var test =(Math.round(n) / multiplicator);
	return +(test.toFixed(digits));
}
function sortBlockList(block1,block2){
	return block2.split(':')[2]-block1.split(':')[2];
}
function sortMinerList(miner1,miner2){
	return miner2.hashrate-miner1.hashrate;
}
function sortWorkerList(worker1,worker2){
	var worker1Name = worker1.name.split(".")[1];
	var worker2Name = worker2.name.split(".")[1];
	var numReg = new RegExp(/\d+/);
	var hasNum1 = numReg.test(worker1Name);
	var hasNum2 = numReg.test(worker2Name);
	if(!worker1.online){
		return -1;
	}else if(!worker2.online){
		return 1;
	}
	if(hasNum1||hasNum2){
		if(hasNum1&&hasNum2){
			return parseInt(worker1Name.match(numReg)[0]) - parseInt(worker2Name.match(numReg)[0])
		}else if(numReg.test(worker1Name)){
			return 1;
		}else {
			return -1;
		}
	}else {
		return worker1Name>worker2Name?1:-1
	}
}
function hasMoreList(list,index,pageSize){
	var hasMore = false;
	if((index+1)*pageSize<list.length){
		hasMore=true;
		return {
			hasMore:hasMore,
			result:list.slice(index*pageSize,(index+1)*pageSize)
		}
	}else {
		return {
			hasMore:hasMore,
			result:list.slice(index*pageSize)
		}
	}
}
function pageNavList(list,index,pageSize){
	var pageAmount = Math.ceil(list.length/pageSize);
	return {
		pageAmount:pageAmount,
		result:list.slice(index*pageSize,(index+1)*pageSize)
	}

}
var stats = module.exports = function(logger){
	var poolConfig = JSON.parse(process.env.pools);
	var portalConfig = JSON.parse(process.env.portalConfig);
	var redisConfig = portalConfig.redis;
	var redisClient = rediscreateClient(redisConfig.port,redisConfig.host,redisConfig.password);
	var _this = this;
	var logSystem = 'Website';
	this.dataReady = false;
	this.cacheStats = {};
	this.cacheStatsLite = {};
	this.cacheStatsString = '';
	this.statHistory = [];
	this.statHistoryLength = portalConfig.website.stats.historicalRetention/portalConfig.website.stats.updateInterval;
	async.waterfall([
		function(callback){
			redisClient.zrangebyscore(["statHistoryLite","-inf","+inf"],function(err,res){
				if(err){
					logger.error(logSystem, 'Historics', 'Error adding reverse historics ' + JSON.stringify(err));	
					callback(err);
				}
				res.forEach(function(e,i){
					_this.statHistory.push(e);
				})
				callback(null);
			})
		}
		],function(err,result){
			if(err){

			}
			logger.debug(logSystem, 'Historics', 'reversed history!');
		})
	function updateStaticData(){
		var shareMultiplier = Math.pow(2, 32) / algos[poolConfig.ulord.coin.algorithm].multiplier;
		var retentionTime = (((Date.now() / 1000) - portalConfig.website.stats.historicalRetention) | 0);
		var windowTime = (((Date.now() / 1000) - portalConfig.website.stats.hashrateWindow) | 0).toString();
		redisClient.multi([
			['zremrangebyscore', 'ulord:hashrate', '-inf', '(' + windowTime],
			['hgetall','ulord:stats'],
			['smembers','ulord:blocksPending'],
			['smembers','ulord:blocksConfirmed'],
			['zrange', 'ulord:payments', -100, -1],
			['zrangebyscore', 'ulord:hashrate', windowTime, '+inf'],
			['hgetall','ulord:shares:roundCurrent']
			]).exec(function(err,replies){
				var workerStats = {};
				var minerStats = {};
				var totalHashrate = 0;
				var workerCounts = 0;
				var minerCounts = 0;
				var totalShares = 0;
				_this.cacheStats.networkDiff = replies[1].networkDiff;
				_this.cacheStats.networkSols = getReadableNetworkHashRateString(replies[1].networkSols)
				_this.cacheStats.blocksPending = replies[2];
				_this.cacheStats.blocksConfirmed = replies[3];
				_this.cacheStats.payments = replies[4];
				replies[5].forEach(function(e,i){
					var workerName = e.split(":")[1];
					var minerName = workerName.split(".")[0];
					var shareDiff = e.split(":")[0];
					var submitTime = e.split(":")[2];
					totalHashrate += parseFloat(shareDiff);
					if(workerStats[workerName]){
						workerStats[workerName].hashrate += parseFloat(shareDiff);
						workerStats[workerName].Diff = shareDiff;
						workerStats[workerName].lastSubmitTime = submitTime;
						
					}else {
						workerStats[workerName] = {};
						workerStats[workerName].Diff = shareDiff;
						workerStats[workerName].lastSubmitTime = submitTime;
						workerStats[workerName].hashrate = parseFloat(shareDiff);
					}
					if(minerStats[minerName]){
						minerStats[minerName].shares += parseFloat(shareDiff);
						if(shareDiff<0){
							minerStats[minerName].invalidShares += parseFloat(shareDiff)
						}
					}
					else {
						minerStats[minerName] = {};
						minerStats[minerName].shares = parseFloat(shareDiff);
						minerStats[minerName].invalidShares = 0;
						if(shareDiff<0){
							minerStats[minerName].invalidShares = parseFloat(shareDiff)
						}
					}
				})
				for(var i in replies[6]){
					if(minerStats[i.split(".")[0]]){
						if(minerStats[i.split(".")[0]].roundShares){
							minerStats[i.split(".")[0]].roundShares += parseFloat(replies[6][i]);
						}else {
							minerStats[i.split(".")[0]].roundShares = parseFloat(replies[6][i]);
						}
					}
					totalShares+=parseFloat(replies[6][i])
				}
				for(var i in workerStats){
					workerStats[i].hashrate = shareMultiplier * workerStats[i].hashrate / portalConfig.website.stats.hashrateWindow;
				}
				for(var i in minerStats){
					minerStats[i].hashrate = shareMultiplier * minerStats[i].shares / portalConfig.website.stats.hashrateWindow;
				}
				_this.cacheStats.totalHashrate = shareMultiplier * totalHashrate / portalConfig.website.stats.hashrateWindow;
				_this.cacheStats.workerStats = workerStats;
				_this.cacheStats.minerStats = minerStats;
				_this.cacheStats.totalShares = totalShares;	
				_this.cacheStats.time = new Date().valueOf();
				for(var i in _this.cacheStats.workerStats){
					workerCounts++;
				}
				for(var i in _this.cacheStats.minerStats){
					minerCounts++;
				}
				_this.cacheStats.workerCounts = workerCounts;
				_this.cacheStats.minerCounts = minerCounts;
				_this.cacheStatsLite = JSON.parse(JSON.stringify(_this.cacheStats))
				delete _this.cacheStatsLite["blocksPending"];
				delete _this.cacheStatsLite["blocksConfirmed"];
				delete _this.cacheStatsLite["payments"];
				delete _this.cacheStatsLite["workerCounts"];
				delete _this.cacheStatsLite["minerCounts"];
				delete _this.cacheStatsLite["totalShares"];
				for(var i in _this.cacheStatsLite.workerStats){
					delete _this.cacheStatsLite.workerStats[i].Diff;
				}
				for(var i in _this.cacheStatsLite.minerStats){
					delete _this.cacheStatsLite.minerStats[i].shares;
					delete _this.cacheStatsLite.minerStats[i].invalidShares;
					delete _this.cacheStatsLite.minerStats[i].roundShares;
				}
				_this.cacheStatsString = JSON.stringify(_this.cacheStatsLite); 
				_this.statHistory.push(_this.cacheStatsString);
				if(_this.statHistory.length>_this.statHistoryLength){
					_this.statHistory = _this.statHistory.slice(_this.statHistory.length - _this.statHistoryLength)
				}
				_this.ChartsDataPool = (function(){
					var result = [];
					for(var i = 0;i<_this.statHistory.length;i++){
						var point = JSON.parse(_this.statHistory[i]);
						var part = [];
						var previousData = 0;
						if(result.length>0){
							previousData = new Date(result[result.length-1][0]);
							if(new Date(point.time).getMinutes() == previousData.getMinutes()){
								continue;
							}
						}
						if(new Date(point.time).getMinutes()%5==0){
							part.push(point.time);
							part.push(point.totalHashrate);
							result.push(part);
						}	
					}
					return result;
				})();
				_this.MinerList = (function(){
					var resultRaw = JSON.parse(JSON.stringify(_this.cacheStats.minerStats));
					var result = []
					for(var x in _this.cacheStats.minerStats){
						for(var y in _this.cacheStats.workerStats){
							if(y.indexOf(x)!==-1){
								if(resultRaw[x].workerCount){
									resultRaw[x].workerCount++;
								}else {
		
									resultRaw[x].workerCount = 1;
								}
							}
						}
					}
					for(var i in resultRaw){
						result.push({
							name:i,
							hashrate:resultRaw[i].hashrate,
							roundShares:resultRaw[i].roundShares||0,
							invalidShares:resultRaw[i].invalidShares,
							workerCount:resultRaw[i].workerCount
						})
					}

					return result.sort(sortMinerList);
				})()
				_this.BlockList = (function(){
					var blockList = _this.cacheStats.blocksPending.concat(_this.cacheStats.blocksConfirmed);
					var currentDate = new Date();
					var currentDay = currentDate.getDate();
					var currentYear = currentDate.getFullYear();
					var currentMonth = currentDate.getMonth();
					var breakPoint = 0;
					blockList.sort(sortBlockList)
					for(var i = 0;i<blockList.length;i++){
						var blockTempDate =new Date(parseInt(blockList[i].split(":")[4]));
						if(blockTempDate.getMonth()===currentMonth && blockTempDate.getDate()===currentDay&& blockTempDate.getFullYear()===currentYear){

						}else {
							breakPoint = i
							break;
						}
					}
					return blockList.slice(0,i);
			
				})()
				delete _this.cacheStats.blocksPending;
				delete _this.cacheStats.blocksConfirmed;
				_this.dataReady = true;
				redisClient.multi([
					['zadd','statHistoryLite',_this.cacheStats.time,_this.cacheStatsString],
					['zremrangebyscore', 'statHistoryLite', '-inf', '(' + retentionTime*1000]
					]).exec(function(err,res){
						if (err){
							logger.error(logSystem, 'Historics', 'Error adding stats to historics ' + JSON.stringify(err));
						}
					})
				})
		}

		this.getPoolStats = function(){
			var hashrateAverage = _this.statHistory.reduce(function(prev,e,i){
				return parseFloat(JSON.parse(e).totalHashrate)+prev;
			},0)
			hashrateAverage = hashrateAverage/_this.statHistory.length;

			if(typeof(_this.cacheStats.networkDiff)=="null"||typeof(_this.cacheStats.networkSols)=="null"){
				return {
					message:"err",
					reseaon:"This api is no ready" 
				}
			}
			return {
				minerCounts:_this.cacheStats.minerCounts,
				workerCounts:_this.cacheStats.workerCounts,
				networkDiff:_this.cacheStats.networkDiff||"",
				networkSols:_this.cacheStats.networkSols||"",
				totalHashrate:_this.cacheStats.totalHashrate,		
				hashrateAverage:hashrateAverage									
			}
		}
		this.getBlockList = function(index){
			var result = hasMoreList(_this.BlockList,index,10)
			return result
			
		}
		this.getMiner_Stats = function(address,index){
			if(!address||address.length!=34 || address[0] != poolConfig.ulord.address[0]){
				return {errMessage:"Not correct address!"}
			}
			var addressInfo ={};
			var workerHashrateAverage = {};
			addressInfo.workerStats=[];
			var historyTemp;
			addressInfo.address = address;
			for(var x in _this.cacheStats.workerStats){
				if(x.indexOf(address)!==-1){
					addressInfo.workerStats.push({
						hashrate:_this.cacheStats.workerStats[x].hashrate,
						name:x,
						Diff:_this.cacheStats.workerStats[x].Diff,
						lastSubmitTime:_this.cacheStats.workerStats[x].lastSubmitTime,
						online:true
					})
				}
			}
			for(var i = _this.statHistory.length-1;i>=0;i--){
				historyTemp = JSON.parse(_this.statHistory[i]);
				for(var x in historyTemp.workerStats){
					if(x.indexOf(address)!==-1){
						if(workerHashrateAverage[x]){
							workerHashrateAverage[x].hashTotal += historyTemp.workerStats[x].hashrate;
							workerHashrateAverage[x].hashCount++;
						}else {
							workerHashrateAverage[x] = {};
							workerHashrateAverage[x].hashTotal = historyTemp.workerStats[x].hashrate;
							workerHashrateAverage[x].hashCount = 1;
						}
						var findExistWorker = false;
						for(var j=addressInfo.workerStats.length-1;j>=0;j--){
							
							if(addressInfo.workerStats[j].name==x){
								findExistWorker = true;
								break;
							}
						}
						if(!findExistWorker){
							addressInfo.workerStats.push({
								name:x,
								lastSubmitTime:historyTemp.workerStats[x].lastSubmitTime,
								online:false
							})
						}
						
					}
				}
			}
			function findInHistory(address){
				for(var i in workerHashrateAverage){
					if(i.indexOf(address)!==-1){
						return true
					}
				}
				return false;
			}
			if(findInHistory(address) || (address in _this.cacheStats.minerStats)){

			}else {
				return {
					message:"error",
					messageContent:"找不到该地址！"
				}
			}
			for (var y in workerHashrateAverage){
				workerHashrateAverage[y].hashrateAverage = workerHashrateAverage[y].hashTotal/workerHashrateAverage[y].hashCount;
			}
			addressInfo.hashrate = _this.cacheStats.minerStats[address]?_this.cacheStats.minerStats[address].hashrate:0;
			for(var z=0;z < addressInfo.workerStats.length;z++){

				addressInfo.workerStats[z].hashrateAverage = workerHashrateAverage[addressInfo.workerStats[z].name].hashrateAverage;
			}
			addressInfo.workerStats = pageNavList(addressInfo.workerStats.sort(sortWorkerList),index,10)
			return addressInfo;
		}

		this.getMinerList = function(index){
			var result = hasMoreList(_this.MinerList,index,10);
			var shareMultiplier = Math.pow(2, 32) / algos[poolConfig.ulord.coin.algorithm].multiplier;
			result.minerCounts = _this.cacheStats.minerCounts;
			result.workerCounts = _this.cacheStats.workerCounts;
			result.shares = _this.cacheStats.totalShares;
			return result
		}
		this.getChartsDataPool = function(){
			return _this.ChartsDataPool;
		}
		this.getChartsDataAddress = function(address){
			var result = [];
			var previousData = 0;
			for(var i = 0;i<_this.statHistory.length;i++){
				var data = JSON.parse(_this.statHistory[i]);
				if(result.length>0){
					previousData = new Date(result[result.length-1][0])
					if(previousData.getMinutes()==(new Date(data.time).getMinutes())){
						continue;
					}
				}
				if(new Date(data.time).getMinutes()%5==0){
					if(address in data.minerStats){
						result.push([data.time,data.minerStats[address].hashrate])
					}		
				}

			}
			return result;
		}
		this.getPaymentsData = function(address,index){
			return new Promise(function(resolve,reject){
				var resultRaw = {};
				var paymentsDataTmp = [];
				resultRaw.paymentsData = [];
				resultRaw.payouts = 0;
				resultRaw.immature = 0;
				resultRaw.balances = 0;
				var temp = {}
				for(var i=0;i < _this.cacheStats.payments.length;i++){
					temp = JSON.parse(_this.cacheStats.payments[i])
					if(temp.amounts[address]){
						paymentsDataTmp.push({
							time:temp.time,
							txid:temp.txid,
							amounts:temp.amounts[address]
						})
					}
	
				}
				if(index==0){
					resultRaw.paymentsData = pageNavList(paymentsDataTmp.reverse(),index,10)
				}else {
					resultRaw.paymentsData = pageNavList(paymentsDataTmp.reverse(),index,10)
					resolve(resultRaw)
				}
				redisClient.multi([
					['hgetall','ulord:immature'],
					['hgetall','ulord:balances'],
					['hgetall','ulord:payouts']
					]).exec(function(err,replies){
						if(err){
							reject(err)
						}
						for(var i in replies[0]){
							if(i.indexOf(address)!==-1){
								resultRaw.immature+=roundTo(parseInt(replies[0][i])/100000000,8);
							}
						}
						for(var i in replies[1]){
							if(i.indexOf(address)!==-1){
								resultRaw.balances+=roundTo(parseFloat(replies[1][i]),8);
							}
						}
						for(var i in replies[2]){
							if(i.indexOf(address)!==-1){
								resultRaw.payouts+=roundTo(parseFloat(replies[2][i]),8);
							}
						}
						resolve(resultRaw)
						
					})

			})
			
		}
		//updateStaticData();
		setInterval(updateStaticData,portalConfig.website.stats.updateInterval*1000)

	}
