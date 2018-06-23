var redis = require('redis');
var async = require('async');
var Stats = require('./statsEx.js');



var api = module.exports = function(logger){
	var statsObj = new Stats(logger);

	this.handleApiRequest = function(req, res, next){
		if(statsObj.dataReady){
			switch(req.params.method){
			case "poolStats":          // 矿池状态
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getPoolStats()));
			break;
			case "blockList":           //区块列表
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getBlockList(parseInt(req.query['index']))));	
			break;
			case "minerStats":         //矿工状态 ?address=
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getMiner_Stats(req.query['address'],parseInt(req.query['index']))));
			break;
			case "minerList":          //矿工列表
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getMinerList(parseInt(req.query['index']))));
			break;
			case "chartsDataPool":     //主页矿池状态图标
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getChartsDataPool()));
			break;
			case "chartsDataAddress":     //用户的图表?address=
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getChartsDataAddress(req.query['address'])));
			break;
			case "paymentsData":     //用户的图表?address=
			res.header('Content-Type', 'application/json');
			statsObj.getPaymentsData(req.query['address'],parseInt(req.query['index'])).then(function(data){
				res.json(data);
			})
			break;
			default:
			next();
		}
	}else {
		res.header('Content-Type', 'application/json');
		res.json({message:"error",messageContent:"数据尚未同步"});
	}

}

}
