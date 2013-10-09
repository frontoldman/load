define(['.../units/units','../style/style','../sizzle/sizzle'],function(units,style,sizzle){

	"use strict";
	
	var easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p*Math.PI ) / 2;
		}
	};
	
	var styleMeasureByNumericPattern = /(width)|(height)|(left)|(top)|(opacity)|(font\-*size)|(margin)|(padding)|(border)/i;
	
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
		
		var time = 13,		//定时器间隔时间
            startTime = (new Date()).getTime(),	//开始时间
			distance = {},	//产生变化的距离的大小
			animateInterval,
			type ;
		
		//初始化参数
		if(duration){
			type = units.getType(duration);
			
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
			type = units.getType(easing);	
			
			if(type === 'Function'){
				complete = easing;
				easing = defaultVal.easing;
			}
					
		}else{
			easing = defaultVal.easing;
		}
		
		
		//console.log(duration,easing,complete)
		//return;
		
		//初始化可以动画的样式distance
		units.each(props,function(key,value){
			if(styleMeasureByNumericPattern.test(key)){
				value = /^\s*(\-?\d+)/.exec(value);
				if(value && value.length >= 2){
					value = value[1]*1;
					var currentStyle = style.get(elem,key)
					console.log(currentStyle)
					distance[key] = value - currentStyle;
				}
			}
		})
		
		console.log(distance);
		
		return ;
		
		animateInterval = setInterval(function(){
				
			var remaining = duration + startTime - (new Date()).getTime();
			
			if(remaining <= 0){ //jQuery动画停止的标志是时间，真正的时间
				clearInterval(inter)
				//修正位置
				
				//执行回调
				
				return;
			}

			var temp = remaining / duration || 0;
			var percent = 1 - temp;
			var pos = fn( percent ,duration * percent,0, 1, duration);
			
			//根据偏移百分比计算偏移量，需要知道什么样的样式是以数值做单位的
			//width,height,left,top,opacity,font-size,margin,padding,border
			
			
				
		},time)
				
	}

	return animate;
})