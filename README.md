load
====

The module loader

模块加载器

没有完全按照AMD模块标准，没有提供id为模块重命名


//加载器用法与模块写法
require(['./a','./b'],function(a,b){
  
  return {}
  
})

修复了相对路径对绝对路径的转换


修复了重复模块的加载bug

//TODO

解决互相依赖的问题 //以解决

//TODO

解决样式加载问题
