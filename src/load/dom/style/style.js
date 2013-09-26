
define(['.../units/units','../sizzle/sizzle'],function(units,sizzle){
	
	var getStyleFn = (function(){;
						var getStyle = document.defaultView && document.defaultView.getComputedStyle
						if(getStyle){
							return function(obj,prop){
								document.defaultView.getComputedStyle (obj,null)[prop]
							}
						}else{
							return function(obj,prop){
								obj.currentStyle[prop];  
							}
						}
						//alert(document.defaultView.getComputedStyle);
					})()

	alert(getStyleFn)
	var style = function(dom){

	}

	return  style;
})