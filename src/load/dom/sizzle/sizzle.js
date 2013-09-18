define(['.../units/units'],function(units){
	
	var doc = document;
	
	/**
		selector:String css选择器字符串
		context:obj 上下文环境，默认是document
	**/
	
	var patternSelector = {
		'#(\\\w+)':function(selector,context){
						return context.getElementById(selector);
					},
		'\\\.(\\\w+)':function(selector,context){
						
					}
	}
	
	
	var sizzle = function(selector,context){
		
		if(!context){
			context = doc;
		}
		
		selector = units.trim(selector);
		
		
		if(doc.querySelectorAll){
			return context.querySelectorAll(selector);
		}else{			
			var selectorAry = selector.split(/\s+/);
			selectorAry
			
		}
	}
	
	return  sizzle;
})