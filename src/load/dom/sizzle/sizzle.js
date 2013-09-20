define(['.../units/units'],function(units){
	
	var doc = document;
	
	
	
	var patternSelector = {
		'#(\\\w+)':function(selector,context){
						return context.getElementById(selector);
					},
					//context：node,nodeList,elementsCollection
		'\\\.(\\\w+)':function(selector,context){

						return getByClass(selector,context);
					}
	}
	
	/**
		selector:String css选择器字符串
		context:obj 上下文环境，默认是document
	**/
	
	var sizzle = function(selector,context){
		
		if(!context){
			context = doc;
		}
		
		selector = units.trim(selector);
		
		

		if(doc.querySelectorAll){
			return context.querySelectorAll(selector);
		}else{			
			var selectorAry = selector.split(/\s+/)
				,parents = context;

			units.each(selectorAry,function(key,value){
				var selectorPattern,result ;
				for(var i in patternSelector){
					selectorPattern = new RegExp(i);

					result = selectorPattern.exec(value);
					if(result.length >= 2){
						parents = patternSelector[i](result[1],parents);
					}
					//alert(result.length)
				}
			})
			
		}
	}
	
	//通过class查找
	function getByClass(className,context){

		var eles;
		if(context.getElementsByClassName){
			eles = context.getElementsByClassName(className);
		}else{
			eles = context.getElementsyTagName('*');
			

			
		
		}
		return eles;
	}


	// var a = {'a':1}
	// var e = {'e':{name:'e'}}
	// var x = units.extend(true,a,{b:1},{c:1},{d:1},e)

	// console.log(a);
	// a.e.name = 'ea';
	// console.log(a.e.name);
	// console.log(e.e.name);
	//console.log(x)

	sizzle.units = units;
	return  sizzle;
})