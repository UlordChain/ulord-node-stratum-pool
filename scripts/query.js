var redis = require("redis");
var fs = require("fs");
var os = require("os")
var config = fs.readFileSync("../config.json");
var worker_address="";
config = JSON.parse(config);


function deal_query(worker_address){
    client.multi([
        ["zrangebyscore","ulord:hashrate","-inf","+inf"],
        ["zrangebyscore","ulord:payments","-inf","+inf"],
        ["hgetall","ulord:immature"]
    ]).exec(function(err,result){
        var resultHashrate = result[0];
        var resultPayments = result[1];
        var resultImmature = result[2];
        var result
        var immatureAmount = 0;
        var currentShare = 0;
        resultHashrate.forEach(function(data){
            if(data.indexOf(worker_address)!==-1){
                currentShare+=parseFloat(data.split(':')[0]);
            }
        })
        console.log("\03\033[2J\033[0;0H\033[30m-\33[37m矿工地址："+worker_address+"\033[0m");
        console.log("\033[30m-\33[37m矿工状态："+(currentShare==0?"\033[30m-\33[31m 停止":"\033[30m-\33[32m 挖矿")+"\033[0m");
        console.log("目前状态：");
        for (var i in resultImmature){
            if(i.indexOf(worker_address)!==-1){
                immatureAmount+=resultImmature[i];
            }
        }
        console.log("\033[30m-\33[34m未确认收益： "+immatureAmount+"  当前速度（shares）： "+currentShare+"\033[0m");
        console.log("交易记录：");
        resultPayments.forEach(function(data){
            if(data.indexOf(worker_address)!==-1){
                data = JSON.parse(data)
                console.log("\033[30m-\33[37m"+new Date(data.time).toLocaleString()+'   交易额：'+data.amounts[worker_address]+"\033[0m");
            }
        })
    })

}
var client = redis.createClient({
    host:config.redis.host,
    port:config.redis.port,
    password:config.redis.password
})
process.stdout.write("Redis connect success！Please enter the worker address to query:");
process.stdin.setEncoding('utf8');
process.stdin.on("data",function(chunk){
    if(chunk===os.EOL){
        process.stdin.pause();
        worker_address=worker_address.slice(0,-1);
        deal_query(worker_address);
    }
    worker_address+=chunk;
})

