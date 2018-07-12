var redis = require("redis");
var fs = require("fs");
var os = require("os")
var config = fs.readFileSync("../config.json");
var block="";
config = JSON.parse(config);


function deal_query(block){
    client.hgetall("ulord:shares:times"+block,function(err,obj){
        var maxTime = 0;
        for(var i in obj){
            if(parseFloat(obj[i])>maxTime){
                maxTime = parseFloat(obj[i])
            }
            console.log(obj[i])
        }
        console.log(maxTime)
    })

}
var client = redis.createClient({
    host:config.redis.host,
    port:config.redis.port,
    password:config.redis.password
})
process.stdout.write("Redis connect success！Please enter the block to query:");
process.stdin.setEncoding('utf8');
process.stdin.on("data",function(chunk){
    if(chunk===os.EOL){
        process.stdin.pause();
        console.log(block);
        block = block.slice(0,-1);
        deal_query(block);
    }
    block+=chunk;
})

