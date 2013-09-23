define(['.../units/units'],function(units){
	
	var doc = document,
		concat = Array.prototype.concat,
		slice = Array.prototype.slice,
		//http://www.nowamagic.net/javascript/js_RemoveRepeatElement.php
		unique = function(arr){
					for(var i=0;i<arr.length;i++)
						for(var j=i+1;j<arr.length;j++)
							if(arr[i]===arr[j]){arr.splice(j,1);j--;}           
					return arr;
				},
		makeArray = (function(){
						var makeArrayFn;
						try{
							slice.call(document.documentElement.childNodes, 0)[0].nodeType;
							makeArrayFn = function(obj){
								return slice.call(obj,0)
							}
						}catch(e){
							makeArrayFn = function(obj){
								var res = [];
								for(var i=0,len=obj.length; i<len; i++){
									res.push(obj[i]);
								}
								return res;
							}
						}
						
						return makeArrayFn;
					})();
	
	//console.log(makeArray)
	function findClassesAndTagNames(selector,context,callback){
		var tempNodeCollection,
			i,
			len,
			singleNodeListsGetByClassName;
		if(context.nodeName){
			tempNodeCollection = callback(selector,context);
			//console.log(tempNodeCollection)
		}else if(context.length){
		
			tempNodeCollection = [];
			//遍历父级NodeList,取得所选标签并且去重
			for(i = 0,len = context.length;i < len;i++){
				if(singleNodeListsGetByClassName = callback(selector,context[i])){
					tempNodeCollection.push(singleNodeListsGetByClassName);
					
				}								
			}
			tempNodeCollection = concat.apply([],tempNodeCollection);
			//TODO 去重
		}
		
		return tempNodeCollection ? tempNodeCollection : null;
	}
	
	
	var patternSelector = {
		'^#(\\\w+)$':function(selector,context){
						return context.getElementById(selector);
					},
					//context：node,nodeList,elementsCollection
		'^\\\.(\\\w+)$':function(selector,context){
							//判断一个上下文环境是不是一个单独的标签
							//判断这个对象有没有tagName 
							return findClassesAndTagNames(selector,context,getByClass);
						},
						//tagName 不区分大小写
		'^([A-Za-z]+)$':function(selector,context){
							var tempNodeCollection,
								i,
								len,
								singleNodeListsGetByTagName;
								//console.log(context)
							if(context.nodeName){
								tempNodeCollection = context.getElementsByTagName(selector);
							}else if(context.length){
								tempNodeCollection = [];
								//遍历父级NodeList,取得所选标签
								//console.log(context)
								for(i = 0,len = context.length;i < len;i++){
									if(singleNodeListsGetByTagName = context[i].getElementsByTagName(selector)){

										tempNodeCollection.push(makeArray(singleNodeListsGetByTagName))
										
									}								
								}
								tempNodeCollection = concat.apply([],tempNodeCollection);
							}
							//console.log(tempNodeCollection)
							return tempNodeCollection ? tempNodeCollection : null;
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
				//console.log(parents)
				var selectorPattern,result ;
				for(var i in patternSelector){
					selectorPattern = new RegExp(i);
					
					result = selectorPattern.exec(value);
					if(result && result.length >= 2){
						parents = patternSelector[i](result[1],parents);
						break;
					}
				}
			})
			
			parents = units.getType(parents) === 'Array' ? unique(parents) : parents;
			
			return parents == context ? null : parents;
		}
	}
	
	//通过class查找
	/**
		className:String class名字
		context:Node 上下文环境，仅仅是dom,
	**/
	function getByClass(className,context){

		var eles,clsNameAry,i;
		if(context.getElementsByClassName){
			eles = context.getElementsByClassName(className);			
		}else{
			eles = context.getElementsByTagName('*');
			
			var temp = units.filter(eles,function(key,value){
				clsNameAry = value.className.split(/\s+/);
				
				//class名字 是区分大小写的
				for(i = 0;i<clsNameAry.length;i++){
					if(clsNameAry[i] == className){						
						return true;
					}
				}
			})
			eles = temp || null;
					
		}
		//console.log(eles)
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