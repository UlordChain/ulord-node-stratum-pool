var redis = require('redis');
var async = require('async');
var fs = require('fs');
var md5 = require('md5')
var path = require('path')
var Stats = require('./statsEx.js');
var os = require("os");
var Moniter = require('./moniter_api.js');
var rigPath = path.resolve(__dirname,'../web/ulordrig.exe');
var rigVersion = path.resolve(__dirname,'../web/ulordrigVersion');
var rigState = {address:"http://testnet-pool.ulord.one/ulordrig.exe",version:'',md5:''};
function refreshResult(){

	async.waterfall([
		function(callback){
			fs.readFile(rigVersion,"utf8",function(err,data){
				rigState.version = data.replace(os.EOL,"");
				callback(null);
			})
		},
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
var api = module.exports = function(logger){
	var statsObj = new Stats(logger);
	var moniterObj = new Moniter(); 
	this.handleApiRequest = function(req, res, next){
		if(statsObj.dataReady){
			switch(req.params.method){
			case 'rig_stats':			//md5 校验
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(rigState));
			return;
			case "poolStats":          // 矿池状态
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(statsObj.getPoolStats()));
			return;
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
			case "MoniterInfo":
			res.header('Content-Type', 'application/json');
			moniterObj.getMoniterInfo().then(function(data){
				res.json(data)
			},function(err){
				res.json(err)
			})
			case "MoniterShares":
			moniterObj.getMoniterShare(req.query['address']).then(function(data){
				res.json(data)
			},function(err){
				res.json(err)
			})
			break;
			case "MoniterHash":
			moniterObj.getMoniterHash(req.query['address']).then(function(data){
				res.json(data)
			},function(err){
				res.json(err)
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
