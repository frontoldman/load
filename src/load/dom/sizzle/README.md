
<h1>sizzle<h1>

<hr/>

<p>
  类似于JQuery的sizzle选择器，支持了JQuery的绝大部分语法，一些用处极少的语法暂时忽略掉
</p>

<p>
  这是基于load模块加载器的一个模块<br/>
用法如下：<br/>
require('./sizzle',function(sizzle){<br/>
	console.log('#oDiv div+p',sizzle('#oDiv div+p'))<br/>
	console.log('#oDiv div~p',sizzle('#oDiv div~p'))<br/>
	console.log('#oDiv div:odd',sizzle('#oDiv div:odd'))<br/>
	console.log('#oDiv div~p:first',sizzle('#oDiv div~p:first'))<br/>
	console.log('#oDiv div~p:last',sizzle('#oDiv div~p:last'))<br/>
	console.log('#oDiv div~p:eq(1)',sizzle('#oDiv div~p:eq(1)'))<br/>
	console.log('#oDiv div:first-child',sizzle('#oDiv div:first-child'))<br/>
	console.log('#oDiv div:last-child',sizzle('#oDiv div:last-child'))<br/>
	console.log('#oDiv div:nth-child(2)',sizzle('#oDiv div:nth-child(2)'))<br/>

	console.log('#oDiv p[name^=ww]',sizzle('#oDiv p[name^=ww]'));<br/>
	console.log('#oDiv p[name^=ww].p2',sizzle('#oDiv p[name^=ww].p2'));<br/>

	console.log('#oDiv div:nth-child(5n)',sizzle('#oDiv div:nth-child(5n)'))<br/>
})<br/>
</p>
