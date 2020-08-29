var weather = {
    pageWidth: 276, //每一个显示页的宽度
    dotWidth: 22, //索引点宽度
    curIndex: 0,
    dom: {
        input: document.getElementsByTagName('input')[0]
    },
    /**
     * 接口函数
     */
    init: function() {
        this.bindEvent();
    },
    /**
     * jsonp
     * @param {*} value 要传的值
     */
    jsonp: function(value) {
        $('<script>').attr('src', 'http://wthrcdn.etouch.cn/weather_mini?city=' + value + '&callback=showCb').appendTo($(document.body)).remove();
    },

    /**
     * 绑定事件
     */
    bindEvent: function() {
        var _this = this, //指向该weather对象
            value = undefined;
        this.dom.input.onkeydown = function(e) {
            value = this.value;
            if (e.key === 'Enter' && value) {
                $('.show-wrap').html(''); //确保可以多次切换
                _this.jsonp(value);
            }
        }

    },
    /**
     * 初始化索引点
     */
    initDots: function(number) {
        var i = 0; //for循环的i
        if (!$('span', '.dots').length) {
            $('.dots').css('width', `${weather.dotWidth * number}px`);
            if (number > 0) {
                for (; i < number; i++) {
                    $('<span>').appendTo($('.dots'));
                }
            }
        }

    },
    /**
     * 设置索引点的显示状态
     * @param {*} index 
     */
    setDots: function(index) {
        $('span', '.dots').removeClass('active');
        $('span', '.dots').eq(index).addClass('active');
    },
    /**
     * 设置显示天气的页面
     */
    weatherPage: function(options) {
        var showList = undefined;
        //设置总显示页面的宽度
        $('.show-wrap').css({ 'width': `${this.pageWidth * options.number}px` });
        //创建显示页面，options.index为标识
        $('<div>').attr('class', `show${options.index} show-item`).appendTo($('.show-wrap'));
        showList = $(`.show${options.index}`); //变量接收该页面，优化
        // 日期区域
        $('<div>').attr('class', 'date').html(options.date).appendTo(showList);
        //总的描述区域
        $('<div>').attr('class', 'total').appendTo(showList);
        $('<span>').attr('class', 'area').html(options.area)
            .add($('<span>').attr('class', 'type').html(options.type))
            .add($('<span>').attr('class', 'now-temperature').html(options.temperature))
            .appendTo($('.total', `.show${options.index}`));
        //具体描述区域
        $('<div>').attr('class', 'desc').appendTo(showList).append($('<ul>'));
        $('<li>').attr('class', 'type').html(options.type)
            .add($($('<li>').attr('class', 'high').html(options.high)))
            .add($($('<li>').attr('class', 'low').html(options.low)))
            .add($($('<li>').attr('class', 'wind').html(options.wind)))
            .add($($('<li>').attr('class', 'wind-force').html(options.windForce))).appendTo($('ul', `.show${options.index}`));

    }
};
weather.init();
/**
 * 服务器的回调函数
 */
function showCb(data) {
    if (data.desc === 'OK') { //有值才显示
        //匹配 风力 字符串的正则，只保留 3-4级 <3级 >3级 3级 的字符
        var reg = /((\w-\w)|(<\w)|(>\w))|(\w)+[\u4e00-\u9fa5]+/;
        var value = data.data, //传回的数据
            options = {}, //要传的参数对象
            date = new Date(); //时间对象
        options.number = value.forecast.length;
        this.weather.initDots(options.number);
        this.weather.setDots(this.weather.curIndex);
        options.area = value.city;

        value.forecast.forEach(function(ele, i) {
            options.index = i;
            if (i === 0) {
                options.date = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + ele.date + ' 今天';
                options.temperature = value.wendu + '度';
            } else {
                options.date = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + ele.date;
                options.temperature = '';
            }
            options.type = ele.type;
            options.high = '最高温度：' + ele.high;
            options.low = '最低温度：' + ele.low;
            options.wind = '风向：' + ele.fengxiang;
            options.windForce = '风力：' + reg.exec(ele.fengli)[0];
            weather.weatherPage(options);
        });
    }
};

/**
 * 动画
 * @param {*} direction 
 */
function move(direction) {
    if (direction === 'left') {
        $('.show').on('swipeleft', function() {
            weather.curIndex >= $('.show-item').length - 1 ? $('.show-item').length : weather.curIndex++;
            animate(weather.curIndex);
        })
    } else if (direction === 'right') {
        $('.show').on('swiperight', function() {
            weather.curIndex <= 0 ? 0 : weather.curIndex--;
            animate(weather.curIndex);
        })
    }
}

function animate(index) {
    $('.show-wrap').animate({
        'left': -weather.pageWidth * index
    }, function() {
        weather.setDots(index);
    })
}
move('left');
move('right');