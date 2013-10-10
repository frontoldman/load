define(['.../units/units'],function(units){

	"use strict";

	var cacheData = {},
		uuid = 1,
		expando = 'cache' + ( +new Date() + "" ).slice( -8 );  // 生成随机数

	var action = {
		//nodeType : 1||9 dom 或者 document
		data:function(elem,val,data){
			var index,
				myCache;
			//elem.x = {x:{x:1}}
			/**
			dom可以缓存数据，用cacheData是不是有为了 data有统一入口 对外部是关闭的
			**/
			if(elem.window || /\b[1|9]\b/.test(elem.nodeType)){
				index = elem[expando];
				if(!index){
					elem[expando] = ++uuid ;
					index = uuid;
					cacheData[index] = {};
				}

				myCache = cacheData[index];
				if(!data) {
					return myCache[val];
				}
				myCache[val] ? myCache[val].push(data) : 
								myCache[val] = [data];

				return myCache[val];
			}

			return null;
		},

		delData:function(elem,val,data){
			var index,
				myCache,
				myCacheVal,
				i = 0,
				len;

			if(elem.window || /\b[1|9]\b/.test(elem.nodeType)){
				index = elem[expando];
				if(!index){
					return null;
				}
				myCache = cacheData[index];
				myCacheVal = myCache[val];
				if(myCacheVal){
					if(!data){
						myCache[val] = null;
						return myCacheVal;
					}
					for(len = myCacheVal.length ; i<len ; i++){
						if(data == myCacheVal[i]){
						   return myCacheVal.splice(i,1);
						}
					}
				}
				
			}

			return null;

		},
		addEvent : function(elem,type,handler){
			if(elem.addEventListener){
				elem.addEventListener(type,handler,false);
			}else{
				elem.attachEvent('on'+type,handler);
			}
		},
		delEvent : function(elem,type,handler){
			if(elem.removeEventListener){
				elem.removeEventListener( type, handler);
			}else{
				elem.detachEvent( 'on' + type, handler);
			}
		},
		// 修复IE浏览器支持常见的标准事件的API
		fixEvent : function( e ){
			// 支持DOM 2级标准事件的浏览器无需做修复
			if ( e.target ){
				return e;
			}
			var event = {}, name;
			event.target = e.srcElement || document;
			event.preventDefault = function(){
				e.returnValue = false;
			};

			event.stopPropagation = function(){
				e.cancelBubble = true;
			};
			// IE6/7/8在原生的win.event中直接写入自定义属性
			// 会导致内存泄漏，所以采用复制的方式
			for( name in e ){
				event[name] = e[name];
			}
			return event;
		}
	}







	var events = {

		/**
			elem:原生dom
			eventType:事件类型
			fn:回调
		**/
		on:function(elem,eventType,handler){
			var dataVal = eventType+'Events',
				dataData;
				
			dataData = action.data(elem,dataVal,handler);

			if(dataData.length === 1){

				var eventHandler = function(e){
					
					var event = action.fixEvent(e || window.event);
					
					dataData = action.data(elem,dataVal);

					if(!dataData){
						return;
					}
					
					for(var i=0;i<dataData.length;i++){
						if(units.getType(dataData[i]) === 'Function'){
							dataData[i](event);
						}
					}
				}

				action.addEvent(elem,eventType,eventHandler);
				//action.delEvent(elem,eventType,eventHandler);
				action.data(elem,eventType,eventHandler);
			}

		},
		off:function(elem,eventType,handler){
			action.delData(elem,eventType+'Events',handler);
			if(!handler){
				var evnetHandler = action.data(elem,eventType);
				//console.log(evnetHandler);
				action.delEvent(elem,eventType,evnetHandler);
			}
			
		}
	}

	

	return events
})