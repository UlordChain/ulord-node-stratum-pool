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
    //console.log(hashrate);
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
    var COLOR_LINE = '#1A64A4';
    var option = {
        animationDuration: 1000,
        backgroundColor: '#ffffff',
        color: ['#408bbf'],
        legend: {
            // left: 0,
            // top: 10,
            data: ['Ulord'],
            type: '',
            right: 55,
            // itemWidth: 0,
            // itemHeight: 0,
            selectedMode: false
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#333',
            borderWidth: 1,
            padding: [5, 10],
            textStyle: {
                color: '#000',
                fontSize: 12
            },
            formatter: function(params) {
                params = params[0];
                //console.log(params);
                return 'Time: <strong>' + getYearDateTime((parseInt(params.value[0], 10))) + '</strong><br>Hashrate: <strong>' + getReadableHashRateString(params.value[1]) + '</strong> ';
            }
        },
        series: [{
            name: 'Ulord',
            type: 'line',
            showSymbol: false,
            lineStyle: {
                normal: {
                    color: COLOR_LINE
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
                    opacity: 0.4
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
                interval: 4
            },
            splitNumber: 10
        }],
        yAxis: [{
            splitLine: {
                lineStyle: {
                    opacity: 0.4
                }
            },
            boundaryGap: [0, '100%'],
            type: 'value',
            axisLabel: {
                formatter: function (val) {
                    return getReadableHashRateString(val);
                }
            },
            position: 'left',
            // nameTextStyle: {
            //     color: '#6F6F6F'//x轴线名称颜色
            // },
            max: function(value) {
                return (parseInt((value.max))*14/10);
            }
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