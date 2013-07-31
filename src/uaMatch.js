		function uaMatch( ua ) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};
		
		
		
		
		var ua = window.navigator.userAgent;
		
		var browser = uaMatch(ua);
		
		//可以检测safari,opera的最新版本已经检测不了了
		if ( browser.browser == 'chrome' ) {
			browser.webkit = true;
		} else if ( browser.browser == 'webkit' ) {
			browser.browser = 'safari'
		}
		
		alert(ua)	
		alert(browser.browser)
		alert(browser.version)