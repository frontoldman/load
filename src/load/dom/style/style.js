define(['.../units/units','../sizzle/sizzle'],function(units,sizzle){
	
	/**
		为了方便，所有的domObj，均为原生dom元素
	**/
	
	var getStyleFn = (function(){
						var getStyle = document.defaultView && document.defaultView.getComputedStyle
						if(getStyle){
							return function(obj,prop){
								document.defaultView.getComputedStyle(obj,null)[prop];
							}
						}else{
							return function(obj,prop){
								obj.currentStyle[prop];  
							}
						}
						//alert(document.defaultView.getComputedStyle);
					})()

	//alert(getStyleFn)
	
	
	var style = function(dom){
		
	}
	
	style.get = getStyleFn;
	
	return  style;
})