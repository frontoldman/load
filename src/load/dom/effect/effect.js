define(['.../utils/utils','../style/style','../data/data'],function(utils,style,data){

	"use strict";
	
	//缓动函数
	var jQueryEasing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p*Math.PI ) / 2;
		}
	};
	
	var IEColorModel = /^#([a-f0-7]{3}|[a-f0-7]{6})$/i,
		W3CColorModel = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
	
	
	//颜色转换器
	var colorValAdapter = function(colorVal){
		
		var nomalColorVal = [],
			realyColorVal = W3CColorModel.exec(colorVal),
			separater;
		//console.log(realyColorVal)
		//return;
		if(realyColorVal){
			realyColorVal.shift();
			nomalColorVal = realyColorVal;
		}else{
			realyColorVal = IEColorModel.exec(colorVal);
			if( realyColorVal[1].length === 3 ){
				realyColorVal[1] = realyColorVal[1].replace(/\w/i,function($1){
					return $1+$1;
				})
			}
			nomalColorVal = [
								parseInt(realyColorVal[1].substr(0,2),16),
								parseInt(realyColorVal[1].substr(2,2),16),
								parseInt(realyColorVal[1].substr(4,2),16)
							]
		}
		
		
		return nomalColorVal;
	}
	
	var styleMeasureByNumericPattern = /(width|height|left|top|opacity|font\-*size|margin|padding|border|color)/i;
	
	//默认参数
	var defaultVal = {
		duration:500,
		easing:'linear'
	}
	/**
		elem:dom
		props:属性的对象集合
		duration:过渡时间
		easing:缓动函数
		complele:回调函数
	**/
	var animate = function(elem,props,duration,easing,complete){
		
		if(!elem || !props){
			throw new error('the number of parameters is not enough！');
		}
		
		var type;
		
		//初始化参数
		if(duration){
			type = utils.getType(duration);
			
			if(type === 'Function'){
				complete = duration;
				duration = defaultVal.duration;
				easing = defaultVal.easing;
			}else if(type === 'String'){
				easing = duration;
				duration = defaultVal.duration;
			}
		}
		
		if(easing){
			type = utils.getType(easing);	
			
			if(type === 'Function'){
				complete = easing;
				easing = defaultVal.easing;
			}
					
		}else{
			easing = defaultVal.easing;
		}
		
		var args = [elem,props,duration,easing,complete];
		var animateQueue =  data(elem,'animate');
		
		//队列中已有动画在执行，把当前动画存储起来，延迟执行
		if(animateQueue){
			animateQueue.push(args);
			return;
		}else{
			animateQueue = [args];
			data(elem,'animate',animateQueue);
		}
		
		execAnimate.apply(window,args);
	}
	
	
	
	
	var execAnimate = function(elem,props,duration,easing,complete){
	
		
		
		var time = 13,		//定时器间隔时间
            startTime = (new Date()).getTime(),	//开始时间
			distance = {},	//产生变化的距离的大小
			origin = {},	//原始值
			runtimeVal = {},	//运行时的值
			animateInterval,
			animateQueue;	//动画队列
		
		//console.log(duration,easing,complete)
		//return;
		//初始化可以动画的样式distance
		utils.each(props,function(key,value){
			if(styleMeasureByNumericPattern.test(key)){
				var currentStyle = style.get(elem,key);
				//颜色的转换
				if(/color/i.test(key)){
					//console.log(currentStyle)
					currentStyle = colorValAdapter(currentStyle);
					value = colorValAdapter(value);
					distance[key] = [];
					utils.each(currentStyle,function(colorKey,colorValue){
						distance[key].push( parseInt(colorValue,10) - parseInt(currentStyle[colorKey],10));
					});
					return true;
				}
				
				value = /^\s*(\-?(?:0+\.)?\d+)/.exec(value);

				if(value && value.length >= 2){
					value = value[1]*1;
					origin[key] = parseFloat(currentStyle,10);
					distance[key] = value - origin[key];
					return true;
				}
				
				
			}
		})
		

		
		//return ;
		
		animateInterval = setInterval(function(){
				
			var remaining = duration + startTime - (new Date()).getTime();
			if(remaining <= 0){ //jQuery动画停止的标志是时间，真正的时间

				clearInterval(animateInterval)
				//修正位置
				style.set(elem,props);
				//执行回调
				complete && complete.call(elem);
				//继续执行队列中的下一个动画
				animateQueue =  data(elem,'animate');
				//console.log(animateQueue);
				animateQueue.shift();
				if(animateQueue.length){	//如果队列中还有动画继续执行
					execAnimate.apply(window,animateQueue[0]);
				}else{
					data.remove(elem,'animate');
				}
				
				
				return;
			}
			
			var temp = remaining / duration || 0;
			var percent = 1 - temp;
			var pos = animate.jQueryEasing[easing]( percent ,duration * percent,0, 1, duration);

			//根据偏移百分比计算偏移量，需要知道什么样的样式是以数值做单位的
			//width,height,left,top,opacity,font-size,margin,padding,border
			utils.each(distance,function(key,value){
				var originVal = origin[key];
				
				originVal = originVal + value*pos;

				if(!/opacity|color/i.test(key)){
					originVal += 'px';
				}
				console.log(value)
				runtimeVal[key] = originVal;
			})
			
			
			style.set(elem,runtimeVal);
			
				
		},time)
		
	}
	
	animate.jQueryEasing = jQueryEasing;
	
	return animate;
})