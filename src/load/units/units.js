define(function(){
	var units = {}
	
	
	
	function getType(obj){
		return Object.prototype.toString.call(obj);	
	}
	
	function each(obj,callback){
		var continueLoop ,type = getType(obj),i = 0;
		if(type === '[object Array]'){
			for(var len = obj.length;i<len;i++){
				continueLoop = callback.call(obj[i],i,obj[i]);
				if(continueLoop === false){
					break;
				}
			}
		}else if(type === '[object Object]'){
			for(i in obj){
				continueLoop = callback.call(obj[i],i,obj[i]);
				if(continueLoop === false){
					break;
				}
			}
		}
	}
	
	function trim(str){
		return String.prototype.trim ?
				str.trim():
				str.replace(/^\s+|\s+$/g,'');
	}
	
	
	function extend() {
		
		function copy(target,src,isDeepCopy){

			//目标元素必须是Object对象
			if(typePattern.test(getType(target)) && typePattern.test(getType(src))){
				
				each(src,function(key,value){

					if(target[key]){
						return ;
					}

					var type = getType(value),temp;
					if(isDeepCopy === true && typePattern.test(type)){
					
						if(type === '[object Array]'){
							temp = [];
						}else if(type === '[object Object]'){
							temp = {};
						}
						
						target[key] = extend(isDeepCopy,temp,value);	//递归下去复制元素
					}else{
						target[key] = value;
					}
					
				})
			
			}
		}
		
		
		var target,
			src,
			isDeepCopy,
			len = arguments.length,
			typePattern = /Array|Object/;//判断是不是可以扩展的元素，只有Array和Object可以扩展
		
		switch(len){
		
			case 1:break;
		
			case 2:
				target = arguments[0];
				src = arguments[1];
				
				copy(target,src);
				
				break;
				
			case 3:
				isDeepCopy = arguments[0];
				target = arguments[1];
				src = arguments[2];
				
				copy(target,src,isDeepCopy);
				
				break;
			
			default:break;
		}
		
		return target;
	};
	
	var target = {'a':3},src = {'a':1,'b':2,'c':[1,2,3,4]};
	var target = extend(true,target,src);
	console.log(target.c)
	
	
	units.getType = getType;
	units.each = each;
	units.trim = trim;
	
	return units;
})