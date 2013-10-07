(function( win, undefined ){
	var easyEvent = function(){
	// 用来存储数据的全局对象
	var cacheData = {
		/*  1 : {
		 *		eclick : [ handler1, handler2, handler3 ];
		 *		clickHandler : function(){ //... };
		 *	} */
		},
		uuid = 1,
		expando = 'cache' + ( +new Date() + "" ).slice( -8 );  // 生成随机数

	var base = {

		// 设置、返回缓存的数据
		// 关于缓存系统详见：http://stylechen.com/cachedata.html
		data : function( elem, val, data ){
			var index = elem === win ? 0 :
					elem.nodeType === 9 ? 1 :
					elem[expando] ? elem[expando] :
					(elem[expando] = ++uuid),

				thisCache = cacheData[index] ?
				cacheData[index] :
				( cacheData[index] = {} );

			if( data !== undefined ){
				// 将数据存入缓存中
				thisCache[val] = data;
			}
			// 返回DOM元素存储的数据
			return thisCache[val];
		},

		// 删除缓存
		removeData : function( elem, val ){
			var index = elem === win ? 0 :
					elem.nodeType === 9 ? 1 :
					elem[expando];

			if( index === undefined ) return;

			// 检测对象是否为空
			var isEmptyObject = function( obj ) {
					var name;
					for ( name in obj ) {
						return false;
					}
					return true;
				},
				// 删除DOM元素所有的缓存数据
				delteProp = function(){
					delete cacheData[index];
					if( index <= 1 ) return;
					try{
						// IE8及标准浏览器可以直接使用delete来删除属性
						delete elem[expando];
					}
					catch ( e ) {
						// IE6/IE7使用removeAttribute方法来删除属性(document会报错)
						elem.removeAttribute( expando );
					}
				};

			if( val ){
				// 只删除指定的数据
				delete cacheData[index][val];
				if( isEmptyObject( cacheData[index] ) ){
					delteProp();
				}
			}
			else{
				delteProp();
			}
		},

		// 绑定事件
		addEvent : function( elem, type, handler ){
			if( elem.addEventListener ){
				elem.addEventListener( type, handler, false );
			}
			else if( elem.attachEvent ){
				elem.attachEvent( 'on' + type, handler );
			}
		},

		// 删除事件
		removeEvent : function( elem, type, handler ){
			if( elem.addEventListener ){
				elem.removeEventListener( type, handler, false );
			}
			else if( elem.attachEvent ){
				elem.detachEvent( 'on' + type, handler );
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
		},

		// 依次执行事件绑定的函数
		eventHandler : function( elem ){
			return function( event ){
				event = $.fixEvent( event || win.event );
				var type = event.type,
					events = $.data( elem, 'e' + type );

				for( var i = 0, handler; handler = events[i++]; ){
					if( handler.call(elem, event) === false ){
						event.preventDefault();
						event.stopPropagation();
					}
				}
				
				console.debug( event );
			}
		}

	};

	var $ = base;

	var extend = {

		bind : function( elem, type, handler ){
			var events = $.data( elem, 'e' + type ) || $.data( elem, 'e' + type, [] );
			// 将事件函数添加到缓存中
			events.push( handler );
			// 同一事件类型只注册一次事件，防止重复注册
			if( events.length === 1 ){
				var eventHandler = $.eventHandler( elem );
				$.data( elem, type + 'Handler', eventHandler );
				$.addEvent( elem, type, eventHandler );
			}
			
			//console.debug( cacheData );
		},

		unbind : function( elem, type, handler ){
			var events = $.data( elem, 'e' + type );
			if( !events ) return;

			// 如果没有传入要删除的函数则删除该事件类型的缓存
			if( !handler ){
				events = undefined;
			}
			// 如果有具体的函数则只删除一个
			else{
				for( var i = events.length - 1; i >= 0; i-- ){
					var fn = events[i];
					if( fn === handler ){
						events.splice( i, 1 );
					}
				}
			}		

			// 删除事件和缓存
			if( !events || !events.length ){
				var eventHandler = $.data( elem, type + 'Handler' );
				$.removeEvent( elem, type, eventHandler );
				$.removeData( elem, type + 'Handler' );
				$.removeData( elem, 'e' + type );
			}
		}
	};

	return extend;
	};

	win.easyEvent = easyEvent();

})( window, undefined );
