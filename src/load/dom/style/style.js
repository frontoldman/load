define(['.../units/units','../sizzle/sizzle'],function(units,sizzle){
	

	//兼容性的样式映射表
	//0 是标准浏览器
	//1 是ie
	var propMapping = {
		'float':'cssFloat'
	}

	//格式化差异化的css属性值
	var formatProp = function(prop,index){
		if(propMapping[prop]){
			return propMapping[prop]
		}

		return prop;
	}

	/**
		为了方便，所有的domObj，均为原生dom元素
	**/
	
	var getStyleFn = function(elem,prop){
						return elem.currentStyle[prop]; 
						var getStyle = window.getComputedStyle,index ;
						if(getStyle){
							return window.getComputedStyle( elem, null )[prop];
						}else{
							return elem.currentStyle[prop]; 
						}
							
						//alert(document.defaultView.getComputedStyle);
					}

	//alert(getStyleFn)
	
	
	var style = function(dom){
		
	}
	
	style.get = getStyleFn;
	
	return  style;
})