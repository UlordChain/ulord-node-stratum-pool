var poolHashrateData;
var poolHashrateChart;

var statData;
var poolKeys;

function buildChartData(){
    var pools = {};
    poolKeys = [];
    for (var i = 0; i < statData.length; i+=10){
        for (var pool in statData[i].pools){
            if (poolKeys.indexOf(pool) === -1)
                poolKeys.push(pool);
        }
    }

    for (var i = 0; i < statData.length; i+=10) {
        var time = statData[i].time * 1000;
		for (var f = 0; f < poolKeys.length; f++){
            var pName = poolKeys[f];
            var a = pools[pName] = (pools[pName] || {
                hashrate: []
            });
            if (pName in statData[i].pools){
                a.hashrate.push([time, statData[i].pools[pName].hashrate]);
            }
            else{
                a.hashrate.push([time, 0]);
            }
        }
    }

    poolHashrateData = [];
    for (var pool in pools){
       poolHashrateData.push({
            key: pool,
            values: pools[pool].hashrate
        });
		$('#statsHashrateAvg').text(getReadableHashRateString(calculateAverageHashrate(pool)));
    }
}

function calculateAverageHashrate(pool) {
		var count = 0;
		var total = 1;
		var avg = 0;
		for (var i = 0; i < poolHashrateData.length; i++) {
			count = 0;
			for (var ii = 0; ii < poolHashrateData[i].values.length; ii++) {
				if (pool == null || poolHashrateData[i].key === pool) {
					count++;
					avg += parseFloat(poolHashrateData[i].values[ii][1]);
				}
			}
			if (count > total)
				total = count;
		}
		avg = avg / total;
		return avg;
}

$(function() {
    statsSource.addEventListener('message', function (e) {
        var stats = JSON.parse(e.data);
        for (var pool in stats.pools) {
            $('#statsMiners' + pool).text(stats.pools[pool].minerCount);
            $('#statsWorkers' + pool).text(stats.pools[pool].workerCount);
            $('#statsHashrate' + pool).text(stats.pools[pool].hashrateString);
            $('#statsHashrateAvg' + pool).text(getReadableHashRateString(calculateAverageHashrate(pool)));
            $('#statsLuckDays' + pool).text(stats.pools[pool].luckDays);
            $('#statsValidBlocks' + pool).text(stats.pools[pool].poolStats.validBlocks);
            $('#statsTotalPaid' + pool).text((parseFloat(stats.pools[pool].poolStats.totalPaid)).toFixed(8));
            $('#statsNetworkBlocks' + pool).text(stats.pools[pool].poolStats.networkBlocks);
            $('#statsNetworkDiff' + pool).text(stats.pools[pool].poolStats.networkDiff);
            $('#statsNetworkSols' + pool).text(getReadableNetworkHashRateString(stats.pools[pool].poolStats.networkSols));
            $('#statsNetworkConnections' + pool).text(stats.pools[pool].poolStats.networkConnections);
        }
    });
});

function getReadableHashRateString(hashrate){
       var i = 0;
        var byteUnits = [' H/s', ' KH/s', ' MH/s', ' GH/s', ' TH/s', ' PH/s' ];
        while (hashrate >= 1024){
            hashrate = hashrate / 1024;
            i++;
        }
        return hashrate.toFixed(2) + byteUnits[i];
	/*hashrate = (hashrate * 2);
	if (hashrate < 1000000) {
		return (Math.round(hashrate / 1000) / 1000 ).toFixed(2)+' Sol/s';
	}
    var byteUnits = [ ' Sol/s', ' KSol/s', ' MSol/s', ' GSol/s', ' TSol/s', ' PSol/s' ];
    var i = Math.floor((Math.log(hashrate/1000) / Math.log(1000)) - 1);
    hashrate = (hashrate/1000) / Math.pow(1000, i + 1);
    return hashrate.toFixed(2) + byteUnits[i];*/
}

function timeOfDayFormat(timestamp){
    var dStr = d3.time.format('%H:%M')(new Date(timestamp));
    if (dStr.indexOf('0') === 0) dStr = dStr.slice(1);
    return dStr;
}

function max(arr){
    var maxNum = arr[0][1];
    for(var i = 1;i < arr.length;i++){
        if(arr[i][1] > maxNum){
            maxNum = arr[i][1];
        }
    }
    return maxNum;
}

function displayCharts(){
    nv.addGraph(function() {
        var maxNum = max(poolHashrateData[0].values);
        poolHashrateChart = nv.models.lineChart()
            .margin({left: 80, right: 30})
            .x(function(d){ return d[0] })
            .y(function(d){ return d[1] })
            .yDomain([0, maxNum])
            .useInteractiveGuideline(true);

        poolHashrateChart.xAxis.tickFormat(timeOfDayFormat);

        poolHashrateChart.yAxis.tickFormat(function(d){
            //console.log(d);
            return getReadableHashRateString(d);
        });

        d3.select('#poolHashrate').datum(poolHashrateData).call(poolHashrateChart);

        return poolHashrateChart;
    });
}

function triggerChartUpdates(){
    poolHashrateChart.update();
}

nv.utils.windowResize(triggerChartUpdates);

$.getJSON('/api/pool_stats', function(data){
    statData = data;
    buildChartData();
    displayCharts();
});

statsSource.addEventListener('message', function(e){
    var stats = JSON.parse(e.data);
    statData.push(stats);

    var newPoolAdded = (function(){
        for (var p in stats.pools){
            if (poolKeys.indexOf(p) === -1)
                return true;
        }
        return false;
    })();

    if (newPoolAdded || Object.keys(stats.pools).length > poolKeys.length){
        buildChartData();
        displayCharts();
    }
    else {
        var time = stats.time * 1000;
        for (var f = 0; f < poolKeys.length; f++) {
            var pool =  poolKeys[f];
            for (var i = 0; i < poolHashrateData.length; i++) {
                if (poolHashrateData[i].key === pool) {
                    // poolHashrateData[i].values.shift();
                    poolHashrateData[i].values.push([time, pool in stats.pools ? stats.pools[pool].hashrate : 0]);
					$('#statsHashrateAvg' + pool).text(getReadableHashRateString(calculateAverageHashrate(pool)));
                    break;
                }
            }
        }
        triggerChartUpdates();
    }
});
