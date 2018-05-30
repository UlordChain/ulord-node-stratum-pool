//年-月-日-小时-分钟 时间
function getYearDateTime(now){
    now = new Date(now);
    var year = now.getFullYear();
    var time = getDateLineTime(now);
    return year + "/" + time;
}

//月-日-小时-分钟 时间
function getDateLineTime(now){
    now = new Date(now);
    var date = '';
    var mon = now.getMonth();
    var day = now.getDate();
    var hour = now.getHours();
    var min = now.getMinutes();
    if (mon < 9) {
        date += '0';
    }
    date +=(mon + 1);
    date += '/';
    if (day < 10) {
        date += '0';
    }
    date += day + ' ';
    if (hour < 10) {
        date += '0';
    }
    date += hour;
    date += ':';
    if (min < 10) {
        date += '0';
    }
    date += min;
    return date;
}
//分钟时间
function getDateMintime(now){
    now = new Date(now);
    var date = '';
    var min = now.getMinutes();
    var hour = now.getHours();
    if (hour < 10) {
        date += '0';
    }
    date += hour;
    date += ':';
    if (min < 10) {
        date += '0';
    }
    date += min;

    return date;
}
function getReadableHashRateString(hashrate){
    console.log(hashrate);
    var i = 0;
    var byteUnits = [' H/s', ' KH/s', ' MH/s', ' GH/s', ' TH/s', ' PH/s' ];
    while (hashrate >= 1000){
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
}
//指数图配置参数
function indexOption() {
    var COLOR_LINE = '#1ECDFF';
    var option = {
        animationDuration: 1000,
        backgroundColor: 'transparent',
        color: ['white'],
        legend: {
            // left: 0,
            // top: 10,
            data: ['Ulord'],
            type: '',
            right: 55,
            // itemWidth: 0,
            // itemHeight: 0,
            selectedMode: false,
            textStyle:{
                color:'white'
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 0,
            padding: [5, 10],
            textStyle: {
                color: 'white',
                fontSize: 12
            },
            formatter: function(params) {
                params = params[0];
                //console.log(params);
                return '<span>Hashrate: </span><br><span>' + getReadableHashRateString(params.value[1]) + '</span><br><span>' + getDateLineTime((parseInt(params.value[0], 10))) + '</span>';
            }
        },
        series: [{
            name: 'Ulord',
            type: 'line',
            showSymbol: false,
            lineStyle: {
                color:{
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [{
                        offset: 0, color: '#1ECDFF' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#0D9FFF' // 100% 处的颜色
                    }],
                    globalCoord: false // 缺省为 false
                }
            },
            itemStyle: {
                normal: {
                    color: COLOR_LINE,
                    borderColor: COLOR_LINE
                },
                emphasis: {
                    color: COLOR_LINE
                }
            }
        }],

        xAxis: [{
            splitLine: {
                show: true,
                lineStyle: {
                    opacity: 0.4,
                    color:['white']
                }
            },
            boundaryGap: false,
            type: 'time',
            //type: 'category',
            //data: [],
            axisTick: {
                alignWithLabel: true
            },
            axisLabel: {
                formatter: function(val) {
                    return getDateMintime(parseInt(val, 10));
                },
          //      interval: 4,
                color:'white'
            },
	    maxInterval:14400000,
	    minInterval:600000,
            splitNumber: 10,
            axisLine:{
                lineStyle:{
                    color:"white"
                }
            }
        }],
        yAxis: [{
            splitLine: {
                lineStyle: {
                    opacity: 0.4,
                    color:['white']
                }
            },
            boundaryGap: [0, '100%'],
            type: 'value',
            axisLabel: {
                formatter: function (val) {
		    console.log(val);
                    return getReadableHashRateString(val);
                },
                color:'white'
            },
            axisLine:{
                lineStyle:{
                    color:"white"
                }
            },
            position: 'left'
            // nameTextStyle: {
            //     color: '#6F6F6F'//x轴线名称颜色
            // },
           // max: function(value) {
            //    return (parseInt((value.max))*14/10);
           // }
        }],
        grid: {
            top: 55,
            left: 80,
            right: 55,
            bottom: 55
        }
    };
    return option;
}
