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
		
		
		// Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
		// Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
		// Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
		// If there is a future need to detect specific versions of IE10+, we will amend this.
		//knockout这样检测ie，哈哈还是比较神奇的
		var ieVersion = (function() {
			var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

			// Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
			while (
				div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
				iElems[0]
			);
			return version > 4 ? version : undefined;
		}());
		
		
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