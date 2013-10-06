define(['.../units/units'],function(units){
	
	var isIE = document.documentElement.currentStyle,
		de=document.documentElement;

	//兼容性的样式映射表
	var propMapping = {
		'float':'styleFloat',
		'opacity':'filter'
	}

	var camelPattern = /\-(\w{1})/ig;
	//格式化差异化的css属性值
	var formatProp = function(prop){
		
		prop = prop.replace(camelPattern,function($1,$2){
			return $2.toUpperCase();
		})

		return prop;
	}

	/**
		为了方便，所有的domObj，均为原生dom元素
	**/
	//z-index :如果不设置，有些浏览器返回auto,就是0。
	//visibility ie不设置就是inherit 继承的
	//overflow 不显示设置 就是visible
	var getStyleFn = function(elem,prop){
						
						var styleResult;

						prop = formatProp(prop);

						if(de.currentStyle){
							
							prop = propMapping[prop] ? propMapping[prop] : prop;							
							styleResult = elem.currentStyle[prop];

							if(prop === 'filter') {
								var opacityAry = /alpha\(opacity\=(\d+)\)/.exec(styleResult);
								if(opacityAry && opacityAry.length>=2){
									styleResult = opacityAry[1];
									styleResult = styleResult/100;
								}else{
									styleResult = window.getComputedStyle( elem, null )[prop];
								}
							}
						}else{
							styleResult = window.getComputedStyle( elem, null )[prop];
						}
						
						return 	styleResult;						
					}

	//alert(getStyleFn)
	
	
	var setStyleFn = function(elem,prop,value){

		if(!elem || !prop){
			return;
		}

		var propType = units.getType(prop);
		if(propType === 'String'){
			if(!value) return;
			prop = formatProp(prop);
			if(prop == 'opacity' && isIE){
				prop = 'filter';
				value = parseInt(value) > 1 ? value :value*100;
				value = 'alpha(opacity='+ value +')';
				elem.style['zoom'] = 1;
			}
			elem.style[prop] = value;
		}else if(propType === 'Object'){
			units.each(prop,function(key,value){
				setStyleFn(elem,key,value);
			})
		}
	}

	//from CJ
	function getOffsetNormal(elem) {

		var x=0,y=0;
		if (elem == de) {
			return {
				x:de.scrollLeft,
				y:de.scrollTop
			};
		}
		while (elem) {
			x+=elem.offsetLeft;
			y+=elem.offsetTop;
			elem=elem.offsetParent;
			if (elem && elem!=de) {
				x+=elem.clientLeft;
				y+=elem.clientTop;
			}
		}
		return {
			left:x,
			top:y
		};
	}

	var getOffset = function(elem){

		if(de.getBoundingClientRect){
			return elem.getBoundingClientRect();
		}

		return getOffsetNormal(elem); 
	}



	var getSize = function(elem){
		return {
			width:elem.clientWidth,
			height:elem.clientHeight
		}
	}
	
	var style = function(elem){
		
	}
	
	style.get = getStyleFn;
	style.set = setStyleFn;
	style.getOffset = getOffset;
	style.getSize = getSize;

	return  style;
})