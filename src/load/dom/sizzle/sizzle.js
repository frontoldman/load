define(['.../units/units'],function(units){
	
	var doc = document,
		concat = Array.prototype.concat,
		slice = Array.prototype.slice,
		//http://www.nowamagic.net/javascript/js_RemoveRepeatElement.php
		//学到一个快速去重的方法，利用js特性，把数组值赋给对象的key,判断key是否重复，简单类型当用此方法
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
								return units.getType(obj) === 'Array' ? obj : slice.call(obj,0);
							}
						}catch(e){
							makeArrayFn = function(obj){
								
								if(units.getType(obj) === 'Array'){
									return obj;
								}
								
								var res = [];
								for(var i=0,len=obj.length; i<len; i++){
									res.push(obj[i]);
								}
								return res;
							}
						}
						
						return makeArrayFn;
					})();
	
	
	
	var separatorPattern = /(\w+)[+|>|:]?([.|#]?(\w+))/;
	
	//通过class查找
	/**
		className:String class名字
		context:Node 上下文环境，仅仅是dom,
	**/
	function getByClass(className,context){

		var eles,clsNameAry,i;
		if(context.getElementsByClassName){
			eles = makeArray(context.getElementsByClassName(className));			
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




	function findByClass(selector,context){
		var tempNodeCollection,
			i,
			len,
			singleNodeListsGetByClassName;
		if(context.nodeName){
			tempNodeCollection = getByClass(selector,context);
			//console.log(tempNodeCollection)
		}else if(context.length){
		
			tempNodeCollection = [];
			//遍历父级NodeList,取得所选标签并且去重
			for(i = 0,len = context.length;i < len;i++){
				if(singleNodeListsGetByClassName = getByClass(selector,context[i])){
					tempNodeCollection.push(singleNodeListsGetByClassName);
					
				}								
			}
			tempNodeCollection = concat.apply([],tempNodeCollection);
			//TODO 去重
		}
		//console.log(tempNodeCollection)
		return tempNodeCollection ;
	}
	
	
	function findByTagName(selector,context){
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
		return tempNodeCollection ;
	}
	
	//主要选择器的映射
	var patternSelector = {
		'^#(\\\w+)(.*)':function(selector,context){
							var tempDomById = context.getElementById(selector);
							tempDomById = tempDomById ? [tempDomById] : [];
							return tempDomById;
						},
					//context：node,nodeList,elementsCollection
		'^\\\.(\\\w+)(.*)':findByClass,
						//tagName 不区分大小写
		'^([A-Za-z]+)(.*)':findByTagName
	}
	
	
	
	/**
		selector:String css选择器字符串
		context:obj 上下文环境，默认是document
	**/
	
	var sizzle = function(selector,context){
		
		if(!context){
			context = doc;
		}
		
		return splitByComma(selector,context);
		
		if(doc.querySelectorAll){
			return context.querySelectorAll(selector);
		}else{					
			return splitByComma(selector,context);
		}
	}
	
	
	//逗号分割符
	function splitByComma(selector,context){
		selector = units.trim(selector);
		var selectorAry = selector.split(/\,/),temp = [];
		units.each(selectorAry,function(key,value){
			
			var spaceDoms = splitBySpace(value,context)
			temp.push(makeArray(spaceDoms));
			
		});
		
		//console.log(concat.apply([],temp)[0])
		temp = concat.apply([],temp);
		
		//全部返回数组元素
		temp = unique(temp);
		
		
		return temp;
	}

	//空格分隔符
	function splitBySpace(selector,context){
		selector = units.trim(selector);	
		var selectorAry = selector.split(/\s+/)
			,parents = context;
		
		units.each(selectorAry,function(key,value){
			
			var selectorPattern,result ;
			for(var i in patternSelector){
				selectorPattern = new RegExp(i);
				
				result = selectorPattern.exec(value);
				if(result && result.length >= 2){
					parents = patternSelector[i](result[1],parents);
					//还有特殊分隔符
					if(result.length>=3){
						parents = splitByFilterSymbol(result[2],parents);
						//console.log(parents)
					}

					break;
				}
			}

		})
		

		parents = parents === context ? [] : parents;		
		return parents ;
	}


	var symbolSelector = {
		'+':splitByPlus
	}

	//分隔符 + > : ~
	/**
		selector:string 选择器
		domsLocated：Array  已经被选中的标签数组
	**/
	function splitByFilterSymbol(selector,domsLocated){		
		var filterSymbolPattern = /[+|>|:|~|.]/,
			i,
			len = selector.length,
			preChar ,
			currentChar,
			patternResult,
			_tempSelectorStr;
		

		//console.log(domsLocated)
		for(i = 0;i < len;i++){
			currentChar = selector[i];
			patternResult = filterSymbolPattern.exec(currentChar);
			
			//匹配到了一个特殊字符或者到了字符串的最后都要去尝试过滤一下
			if((patternResult && patternResult.length) || i === len-1){

				if(preChar){

					_tempSelectorStr = selector.slice(preChar.index,i+1);
					console.log(patternResult)
					console.log(preChar)
					console.log(i)
					console.log(_tempSelectorStr)
					domsLocated = symbolSelector[preChar.charCode](_tempSelectorStr,domsLocated);

				}

				if(i === len-1) break;

				preChar = {
					index:i+1,
					charCode:patternResult[0]
				}
				
			}
		}
		//console.log(domsLocated)		
		return domsLocated;
	}
	
	//.分隔符
	function splitByPoint(){
		
	}

	//+分隔符
	function splitByPlus(selector,domsLocated){
		return units.filter(domsLocated,function(key,value){
			console.log(selector)
			return true;
		})
	}




	//dom查找方法
	function next(){

	}

	sizzle.units = units;
	return  sizzle;
})