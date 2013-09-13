;(function(global){
    var __load ,    //加载主函数入口
        __define,   //定义函数 
		__loadScript, //加载脚本函数
        __generatRandomNumber,  //随机数生成器用于在非IE中onload中取得刚define的脚本
        __loaderContainer = {} ,    //模块存储单元
        __mappingOfIDAndURL = {},   //自定义id与URL的映射表
        __isIE =  global.attachEvent && !global.opera,  //判断是否ie
        __recentRandom = 0, //全局随机数
        __analyticDefine,   //脚本解析器

        __type = function(object){
            return Object.prototype.toString.call(object);
        },
		__slice = Array.prototype.slice,
		__head = document.head || document.getElementsByTagName('head')[0] || document.documentElement; //他们都这么写

		
		//重置console,解决ie6报错
        if(!global.console){
             global.console = {
                log:function(){}
             }
        }
	
	/*
	*解析html文件url
	*/
	var prefixUrl;
	
	;(function(globalUrl){
		function dirname(path) {
			var s = path.match(/.*(?=\/.*$)/);
			return (s ? s[0] : '.') + '/';
		}
		prefixUrl = dirname(globalUrl);	
		console.log(prefixUrl);
	})(global.location.href)

   //从seajs抠出来的
    var currentlyAddingScript;
    var interactiveScript;

    var __getCurrentScript = function() {       //解决ie模块加载执行的时候onload不能按照正常顺序执行
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script.
        // Ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        var scripts = __head.getElementsByTagName('script');

        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.readyState === 'interactive') {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    };

  
	
    //入口
	__load = function(){   //require 的时候怎么判断模块之间有没有互相依赖呢???

		var args = arguments;
        if(args.length < 1){
            return;
        }
		var url = args[0];
        //console.log(__loaderContainer);
        url = formatURL(url);//格式化url参数
        var modulesList = {length:0};
        var lock = false;
        if( url && url.length ){
            for(var i = 0 ,len = url.length;i<len;i++){ //只有modulesList的长度==url这个数组的长度才执行回调                                       
                
				modulesList[url[i]] = i;                //通过define完成递归
                if(__loaderContainer[url[i]]){
                    modulesList[i] = __loaderContainer[url[i]]; 
                    modulesList.length ++;
                    callback(i);
                }else{     
                    __loadScript(url[i],function(exports,url){
                        modulesList[modulesList[url]]= exports;
                        modulesList.length ++;
                        callback(i);
                    });
                }
            }
        }

        function callback(x){               
            if(modulesList.length >= len){      //require的回调执行时机
                // console.log(modulesList);
                if(__type(args[1]) === '[object Function]'){
                    args[1].apply(null,__slice.call(modulesList,0));//ie6 apply 第二个参数必须是数组不能是类数组的对象
                }
                lock = true;
            }
        }

        
	}
	
	//开启debug模式，默认不开启，开启之后执行以下操作
	//1、加载的脚本script不会被删除。
	var debug = false;
	__load.openDebug = function(){
		debug = true;
	}
	
	
	__loadScript = function(){ //插入脚本
		var args = arguments,
            length = args.length || 0,
			_script = document.createElement('script'),
            url = args[0];
			
		_script.type = 'text/javascript';
		_script.src = url;
        _script.async = true;
        _script.defer = 'defer';

        _script.onload = _script.onreadystatechange =  function(){
            
           // _script.onload = _script.onreadystatechange = _script.onerror = null; //处理ie9双绑定以及loaded complete顺序错乱的问题
			if(!this.readyState || /loaded|complete/.test(this.readyState)){

 
               //非IE 判断最新随机数的模块为当前模块
                if(!__isIE){
                    __loaderContainer[url] = __loaderContainer[__recentRandom];
                    var id = __mappingOfIDAndURL[__recentRandom];
                    if(id){
                       __mappingOfIDAndURL[url] = id; 
                    }
                    delete __loaderContainer[__recentRandom];
                    __recentRandom = 0;
                }

                //不是标准模块的加载处理?????????不打算处理了


                //IE 在模块define的时候已经取得当前url,已经push进去了
               // console.log(__loaderContainer[url])
                if(__loaderContainer[url]) {
                    if(!__loaderContainer[url].__$delay$){//模块中包含__$delay$ 就是有依赖的模块需要等待
                       // console.log('入口');
                        args[1](__loaderContainer[url],url);
                    }else{                                  //为了能够执行回调，把回调返回到这个临时对象中，
                        __loaderContainer[url].factory = args[1];
                        __loaderContainer[url].url = url;
                    }
                    
                    __recentRandom = 0;
                }else{                                      //标准模块是可以准确的判断加载是否成功
                    __loaderContainer[url] = false;
                    console.log( url + '加载失败！');
                }
                _script.onload = _script.onreadystatechange = null;//解决ie9双绑定的问题

                if ( _script.parentNode && !debug) {             //他们都这么写
                    _script.parentNode.removeChild( _script );
                }

                // Dereference the _script
                _script = null;
			}
		}


        _script.onerror = function(){
            __loaderContainer[url] = false;
            console.log( url + '加载失败！ onerror');
            if(_script){
                _script.onerror = null;
                _script = null;
            }
        }


        currentlyAddingScript = _script;
        __head.insertBefore( _script, __head.firstChild );
        currentlyAddingScript = null;
	}

    /**
     *    AMD设计出一个简洁的写模块API：define 。

         define(id?, dependencies?, factory);

         其中：
         id: 模块标识，可以省略。
         dependencies: 所依赖的模块，可以省略。
         factory: 模块的实现，或者一个JavaScript对象。
     * @private
     */
    __define = function(){  
       var args = __slice.call(arguments,0);

       if(args.length === 1){       //一个参数执行回调
           argslength1(args[0]);
       }else if(args.length === 2){     //两个参数加载依赖，执行回调
           argslength2(args[1],args[0]);          
       } else if(args.length === 3){    //三个参数，再说吧
           argslength2(args[2],args[1],args[0]);
       }
    }

    //一个参数
    var argslength1 = function(funOrObj,id){
        funOrObj =  __type(funOrObj) === "[object Function]" ? funOrObj() : funOrObj;
        __analyticDefine(funOrObj,id);
    }

    //二个参数
   var argslength2 = function (funOrObj, relay ,id) {
		relay = formatURL(relay)
       if(!relay.length){    //判断依赖是否合理
           argslength1(funOrObj); 
           return;
       }
       //__tempFactory是个临时模块，通过这个理临时模块占位，然后通过这个临时模块带回来url和回调函数，一层一层的
       //递归下去，(其实不是递归，只不过把当前回调传入到下一层去了)
       var deep = { length:0 },__tempFactory = {__$delay$:true};//这是一个神奇的对象

       __analyticDefine(__tempFactory,id);            //第一个脚本已经load,需要解析,有依赖，传入一个对象延迟执行
      
        for (var i = 0 , len = _len = relay.length; i < len; i++) {               
           deep[relay[i]] = i;          //顺序传递参数

           if(__loaderContainer[relay[i]]){                    
                defineCallback(__loaderContainer[relay[i]],relay[i]);
           }else{
                __loadScript(relay[i],function(exports,url){  //需要把所有的exports传入到a的回调中去
                    defineCallback(exports,url);
                })
           }
        }
       // }

        function defineCallback(exports,url){
            var index = deep[url];               
                deep[index] = exports ;
                deep.length++ ;
                if(deep.length >= len){
                    //能正确解析依赖的精髓
                    funOrObj =  __type(funOrObj) === "[object Function]" ? funOrObj.apply(null,__slice.call(deep,0)) : funOrObj;
                    __loaderContainer[__tempFactory.url] = funOrObj;

                    var id = __mappingOfIDAndURL[__tempFactory.url];

                    if(id){
                        __loaderContainer[id] = funOrObj;
                    }
     
                    __tempFactory.factory(funOrObj,__tempFactory.url);
                }
        }
    };

    //。。。。
    var argslength3 = function(){

    }

    //过滤传入，格式化传入的参数
    function formatURL(relay){

        relay = __type(relay) === "[object String]" ? [relay] : relay;
         if (relay && __type(relay) === "[object Array]") {
            for(var i = 0 ,len = relay.length; i<len;i++){
                relay[i] = relay[i].replace(/^\s+|\s+$/g,"");//去掉首尾空格
                if(relay[i].length<=0){
                    relay.splice(i,1);
                    continue;
                }
				
				//console.log(prefixUrl)
                relay[i] = /\.\w+\s*$/.test(relay[i]) ? relay[i] : relay[i] + '.js'; 
            }
         }
         return relay;
    }
    /**
     *随机数生成器，通过全局的__recentRandom在非IE浏览器下面取得已经解析的模块
     * @private
     */
    __generatRandomNumber = function(){
        return __recentRandom = Math.random();
    }


    //存储模块，根据url存储模块
    __analyticDefine = function(moudle,id){
        var url;
        __generatRandomNumber();
        if(__isIE){
            var currentScript = __getCurrentScript();
            //  url = currentScript.src;   IE8 + 会取得绝对路径，有问题
            url = currentScript.getAttribute("src");
            __loaderContainer[url] = moudle;
            if(id){
                __loaderContainer[id] = __loaderContainer[url];
                __mappingOfIDAndURL[url] = id;
            }
        } else {
            __loaderContainer[__recentRandom] = moudle;
            if(id){
                __loaderContainer[id] = __loaderContainer[__recentRandom];
                __mappingOfIDAndURL[__recentRandom] = id;
            }
        }

    }


    

    //暴露两个全局函数
    //define 模块定义函数
    //require 模块加载函数
    global.define = __define;
	global.require = __load ;

})(this)