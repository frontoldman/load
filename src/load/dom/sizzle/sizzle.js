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
	
	
	
	//#############################################################
	
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
	
	//################################################
	
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
					//还有特殊分隔符,不能为空字符串
					if( parents && result.length>=3 && result[2].length){
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

	
	
	
	//#########################################
	var symbolSelector = {
		'+':splitByPlus,
		'>':splitByAngleBrackets,
		'~':splitByWave,
		'.':splitByPoint,
		':':splitByColon
	}

	//分隔符 + > ~
	/**
		selector:string 选择器
		domsLocated：Array  已经被选中的标签数组
	**/
	function splitByFilterSymbol(selector,domsLocated){
		
		var newSymbolPattern = /[+|>|~|.|:]/,
			filterSymbolPattern = /[.|:]/,
			i,
			len = selector.length,
			preChar ,
			currentChar,
			patternResult,
			_tempSelectorStr,
			subEndIndex,
			subEnd;
		
		//selector = new String(selector)
		//console.log(domsLocated)
		//console.log(selector)
		for(i = 0;i < len;i++){
			currentChar = selector.charAt(i); //selector[i] #解决ie 6~8 问题
			patternResult = newSymbolPattern.exec(currentChar);
			//console.log(currentChar)
			//匹配到了一个特殊字符或者到了字符串的最后都要去尝试过滤一下
			if((patternResult && patternResult.length) || i === len-1){
				subEndIndex = i;
				
			
				
				//连接起来的.操作符比较特殊，需要分类操作
				if(currentChar === '.'){
					//只要.不在第一个或者.之前没有特殊字符选择器,就跳出当前循环
					if( i == 0 || !newSymbolPattern.test(selector.charAt(i-1))){
						subEndIndex = i-1;	
						if(i == 0){//解决以.开头没法分析错误的bug
							preChar = {
								index:subEndIndex,
								charCode:patternResult[0]
							}
						}
					}else{
						continue;
					}
				}
				
				if(preChar && i){		
					
					_tempSelectorStr = selector.slice(preChar.index+1,i === len-1 ? len : i);
					//console.log(_tempSelectorStr)
					//console.log(domsLocated)
					//console.log(preChar.charCode)
					
					domsLocated = symbolSelector[preChar.charCode](_tempSelectorStr,domsLocated);
					if(!domsLocated.length){
						break;
					}
				}
				
				
				
				if(i === len-1) break;

				preChar = {
					index:subEndIndex,
					charCode:patternResult[0]
				}
				
			}
			
			
		}
		//alert(domsLocated)
		//console.log(domsLocated)		
		return domsLocated;
	}
	
	//.分隔符
	function splitByPoint(selector,domsLocated){
		
		//console.log(domsLocated)
		
		var temp = units.filter(domsLocated,function(key,value){
			var dom = characteristicsFilter(selector,value);
			if(dom){
				return true;
			}
			
		})
		
		//console.log(temp)
		
		return temp ? temp : [];
		
	}

	
	//+分隔符 相邻后元素选择器
	function splitByPlus(selector,domsLocated){
		var temp = [];
		//console.log(domsLocated)
		units.each(domsLocated,function(key,value){
			var nextSibling = next(value,selector);
			
			if(nextSibling){
				temp.push(nextSibling);
			}
			
		})
		return temp;
	}
	
	//>分隔符 直属后代选择器
	function splitByAngleBrackets(selector,domsLocated){
		var temp = [];
		//console.log(domsLocated)
		units.each(domsLocated,function(key,value){
			var child = children(value,selector);
			
			if(child){
				temp.push(child);
			}
			
		})
		temp = concat.apply([],temp)
		return temp;
	}
	
	//~分隔符 相邻后元素选择器s
	function splitByWave(selector,domsLocated){
		var temp = [];
		
		//console.log(domsLocated)
		
		units.each(domsLocated,function(key,value){
			var singleDomnexts = nexts(value,selector);
			
			//console.log(singleDomnexts)
			
			if(singleDomnexts){
				temp.push(singleDomnexts);
			}			
		})
		
		temp = concat.apply([],temp)
		
		//console.log(temp);
		
		return temp;
	}
	
	function splitByColon(selector,domsLocated){

		console.log(selector)
		

		return domsLocated;

	}

	
	//基本选择器
	var colonBasicFilters = {
		'even':function(domsLocated,execAry){},
		'odd':function(domsLocated,execAry){},
		'first':function(domsLocated,execAry){},
		'last':function(domsLocated,execAry){},


		'eq\\\((\d+)\\\)':function(domsLocated,execAry){},		
		'gt\\\((\d+)\\\)':function(domsLocated,execAry){},
		'lt\\\((\d+)\\\)':function(domsLocated,execAry){},

		'not\\\((\w+)\\\)':function(domsLocated,execAry){}
	}

	//子元素选择器
	var colonChildrenFilters = {
		'first-child':function(domsLocated,execAry){},
	}

	//dom查找方法
	function next(dom,sign){
	
		var nextSibling = dom.nextSibling;
		while( nextSibling && nextSibling.nodeType != 1){
			nextSibling = nextSibling.nextSibling;
		}
		
		//console.log(nextSibling)		
		if(sign && nextSibling){
			nextSibling = characteristicsFilter(sign,nextSibling);
		}
		
		
		return nextSibling;
	}
	
	function nexts(dom,sign){
		
		var nextSibilngs = [],
			nextSibling = next(dom);
		
		
		while(nextSibling){
			var isSuccessDom = characteristicsFilter(sign,nextSibling);
			//console.log(isSuccessDom)
			if(isSuccessDom != null){	//判断在循环里面进行，首先是找到了，才会可能发生push
				nextSibilngs.push(nextSibling);
			}
			nextSibling = next(nextSibling)
		}
		console.log(nextSibilngs)		
		return nextSibilngs;
	}
	
	function children(dom,sign){
		var children = dom.children ;
		
		children = makeArray(children);
		
		if(sign){
			children = units.filter(children,function(key,value){
				var isSuccessDom = characteristicsFilter(sign,value);
				if(isSuccessDom != null){
					return true;
				}
			})
		}
				
		return children;
	}
	
	var judgementIdCassTagPattern = /^([.|#])?(\w+)/; //用来检测id和class和tagName,判断array[2] === '.|#';

	//特征过滤
	function characteristicsFilter(sign,dom){
		var selectorVariety = judgementIdCassTagPattern.exec(sign);
		if(selectorVariety){
			switch(selectorVariety[1]){
				case '#':if(dom.id != selectorVariety[2]){
								dom = null;
							}
						break;
				case '.':if(!hasClass(selectorVariety[2],dom)){
							dom = null;
						}
						break;
				
				default:if(!checkTagName(selectorVariety[2],dom)){
							dom = null;	
						}
						break;
			}
		}
		return dom;
	}
	
	
	//判断一个dom元素是否包含这个class
	function hasClass(className,dom){
	
		clsNameAry = dom.className.split(/\s+/);
		
		//class名字 是区分大小写的
		for(i = 0;i<clsNameAry.length;i++){
			if(clsNameAry[i] == className){						
				return true;
			}
		}
		
		return false;
	}
	
	
	function checkTagName(tagName,dom){
		//console.log(dom.tagName)
		return tagName.toUpperCase() === dom.tagName.toUpperCase();
	}
	
	//########################################################
	sizzle.units = units;
	return  sizzle;
})