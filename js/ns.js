// Credits and ideas: NotScripts, AdBlock Plus for Chrome, Ghostery, KB SSL Enforcer
var savedBeforeloadEvents = new Array();
var timer;
var iframe = 0;
// initialize settings object with default settings (that are overwritten by the actual user-set values later on)
var SETTINGS = {
	"MODE": "block",
	"LISTSTATUS": true,
	"WHITELIST": [""],
	"BLACKLIST": [""],
	"WHITELISTSESSION": [""],
	"BLACKLISTSESSION": [""],
	"SCRIPT": true,
	"NOSCRIPT": true,
	"OBJECT": true,
	"APPLET": true,
	"EMBED": true,
	"IFRAME": true,
	"FRAME": true,
	"AUDIO": true,
	"VIDEO": true,
	"IMAGE": false,
	"ANNOYANCES": false,
	"ANNOYANCESMODE": "relaxed",
	"ANTISOCIAL": false,
	"PRESERVESAMEDOMAIN": false,
	"WEBBUGS": true,
	"LINKTARGET": "off",
	"EXPERIMENTAL": "0",
	"REFERRER": true
};
const reStartWProtocol = /^[^\.\/:]+:\/\//i; // credit: NotScripts
function block(event) {
	var el = event.target;
	var elType = el.nodeName.toUpperCase();
	var elSrc = getElSrc(el);
	if (elSrc && elSrc.substr(0,17) != 'chrome-extension:' && elementStatus(elSrc, SETTINGS['MODE'])
		&& (elType == "A" || elType == "IFRAME" || elType == "FRAME" || (elType == "SCRIPT" && SETTINGS['EXPERIMENTAL'] == '0') || elType == "EMBED" || elType == "OBJECT" || elType == "IMG")
		&& (
			(
				(
					(
						(elType == "IFRAME" && SETTINGS['IFRAME'] == 'true')
						|| (elType == "FRAME" && SETTINGS['FRAME'] == 'true')
						|| (elType == "EMBED" && SETTINGS['EMBED'] == 'true')
						|| (elType == "OBJECT" && SETTINGS['OBJECT'] == 'true')
						|| (elType == "SCRIPT" && SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == '0')
						|| (elType == "VIDEO" && SETTINGS['VIDEO'] == 'true')
						|| (elType == "AUDIO" && SETTINGS['AUDIO'] == 'true')
						|| (elType == "IMG" && SETTINGS['IMAGE'] == 'true')
						|| (elType == "A" && SETTINGS['REFERRER'] == 'true')
					)
					&& (
						(SETTINGS['PRESERVESAMEDOMAIN'] == 'true' && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1'))
						|| SETTINGS['PRESERVESAMEDOMAIN'] == 'false'
					)
				)
				|| (
					(
						SETTINGS['ANNOYANCES'] == 'true'
						&& (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) != '0'))
						&& baddies(elSrc, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1'
					)
					|| (SETTINGS['ANTISOCIAL'] == 'true' && baddies(elSrc, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '2')
				)
			)
			|| (
				SETTINGS['WEBBUGS'] == 'true'
				&& (elType == "IMG" || elType == "IFRAME" ||  elType == "FRAME" || elType == "EMBED" || elType == "OBJECT")
				&& (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1')
				&& (
					(typeof $(el).attr('width') !== 'undefined' && $(el).attr('width') <= 5 && typeof $(el).attr('height') !== 'undefined' && $(el).attr('height') <= 5)
					|| (typeof $(el).attr('style') !== 'undefined' && $(el).attr('style').match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i))
					)
			)
			|| (
				SETTINGS['REFERRER'] == 'true' && elType == "A" && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1')
			))) {
		//console.log("BLOCKED: "+elSrc+" | "+elType);
		if (SETTINGS['REFERRER'] == 'true' && elType == "A" && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1')) {
			$(el).attr("rel","noreferrer");
		} else {
			event.preventDefault();
			if (SETTINGS['WEBBUGS'] == 'true' && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1') && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "IMG") && ((typeof $(el).attr('width') !== 'undefined' && $(el).attr('width') <= 5 && typeof $(el).attr('height') !== 'undefined' && $(el).attr('height') <= 5) || (typeof $(el).attr('style') !== 'undefined' && $(el).attr('style').match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i)))) {
				elType = "WEBBUG";
			}
			chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: elType});
			$(el).remove();
		}
	} else {
		if (SETTINGS['EXPERIMENTAL'] == '0' && elSrc && elSrc.toLowerCase().substr(0,11) != 'javascript:' && elSrc.toLowerCase().substr(0,17) != 'chrome-extension:' && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "SCRIPT")) {
			//console.log("ALLOWED: "+elSrc+" | "+elType);
			chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: elType});
		}
	}
}
function postLoadCheck(el) {
	elSrc = getElSrc(el);
	if (elSrc && elSrc.toLowerCase().substr(0,17) != 'chrome-extension:' && elementStatus(elSrc, SETTINGS['MODE']) && ((SETTINGS['PRESERVESAMEDOMAIN'] == 'true' && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1')) || SETTINGS['PRESERVESAMEDOMAIN'] == 'false'))
		return true;
	return false;
}
function fallbackRemover(tag) {
	var elements = document.getElementsByTagName(tag);
	for (var i = 0; i < elements.length; i++) {
		elSrc = getElSrc(elements[i]);
		if (elSrc && elementStatus(elSrc, SETTINGS['MODE']) && ((SETTINGS['PRESERVESAMEDOMAIN'] == 'true' && (thirdParty(elSrc) || domainCheck(relativeToAbsoluteUrl(elSrc).toLowerCase(), 1) == '1')) || SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) {
			if (elements[i].src)
				elements[i].src = "";
			if (elements[i].parentNode)
				elements[i].parentNode.removeChild(elements[i]);
			chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: tag});
		} else {
			if (elSrc) {
				chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: tag});
			}
		}
	}
}
function domainCheck(domain, req) {
	if (req === undefined) {
		if ((SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'strict' && baddies(domain, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddies(domain, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '2')) return '1';
	}
	domainname = extractDomainFromURL(domain.toLowerCase());
	if (domainname.substr(0,4) == 'www.') {
		domainname = domainname.substr(4);
	}
	if (SETTINGS['MODE'] == 'allow' && in_array(domainname, SETTINGS['BLACKLISTSESSION'])) return '1';
	if (SETTINGS['MODE'] == 'block' && in_array(domainname, SETTINGS['WHITELISTSESSION'])) return '0';
	if (in_array(domainname, SETTINGS['BLACKLIST'])) return '1';
	if (in_array(domainname, SETTINGS['WHITELIST'])) return '0';
	if (req === undefined) {
		if (SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'relaxed' && baddies(domain, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1') return '1';
	}
	return '-1';
}
function blockreferrer() {
	$("a[rel!='noreferrer']").each(function() { if (thirdParty(getElSrc(this)) && domainCheck(relativeToAbsoluteUrl(getElSrc(this)).toLowerCase()) != '0') { $(this).attr("rel","noreferrer"); } });
}
function ScriptSafe() {
	if (SETTINGS['LINKTARGET'] != 'off') {
		if (SETTINGS['LINKTARGET'] == 'same') linktrgt = '_self';
		else if (SETTINGS['LINKTARGET'] == 'new') linktrgt = '_blank';
		$("a").attr("target", linktrgt);
	}
	if (SETTINGS['NOSCRIPT'] == 'true') {
		$("noscript").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: $(this).html(), node: 'NOSCRIPT'}); $(this).hide(); }); // hiding instead of removing as removing seems to periodically crash tabs. Not a huge loss as the listener script should filter any inserted content (e.g. iframes, webbugs).
	}
	if (SETTINGS['APPLET'] == 'true') $("applet").each(function() { if (postLoadCheck(this)) { chrome.extension.sendRequest({reqtype: "update-blocked", src: getElSrc(this), node: 'APPLET'}); $(this).remove(); } else { if (getElSrc(this)) { chrome.extension.sendRequest({reqtype: "update-allowed", src: getElSrc(this), node: 'APPLET'}); } } });
	if (SETTINGS['VIDEO'] == 'true') fallbackRemover("VIDEO"); // jquery can't select and beforeload doesn't catch video/audio tags :(
	if (SETTINGS['AUDIO'] == 'true') fallbackRemover("AUDIO"); // ^
	if (SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == '0') {
		clearUnloads();
		$("script").each(function() { if (postLoadCheck(this)) { chrome.extension.sendRequest({reqtype: "update-blocked", src: getElSrc(this), node: 'SCRIPT'}); $(this).remove(); } else { if (getElSrc(this) && getElSrc(this).toLowerCase().substr(0,11) != 'javascript:' && getElSrc(this).toLowerCase().substr(0,17) != 'chrome-extension:') { chrome.extension.sendRequest({reqtype: "update-allowed", src: getElSrc(this), node: "SCRIPT"}); } } });
		if ((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] == 'true' && domainCheck(window.location.href.toLowerCase(), 1) == '1'))) {
			$("a[href^='javascript']").attr("href","javascript:;");
			$("[onClick]").removeAttr("onClick");
			$("[onAbort]").removeAttr("onAbort");
			$("[onBlur]").removeAttr("onBlur");
			$("[onChange]").removeAttr("onChange");
			$("[onDblClick]").removeAttr("onDblClick");
			$("[onDragDrop]").removeAttr("onDragDrop");
			$("[onError]").removeAttr("onError");
			$("[onFocus]").removeAttr("onFocus");
			$("[onKeyDown]").removeAttr("onKeyDown");
			$("[onKeyPress]").removeAttr("onKeyPress");
			$("[onKeyUp]").removeAttr("onKeyUp");
			$("[onLoad]").removeAttr("onLoad");
			$("[onMouseDown]").removeAttr("onMouseDown");
			$("[onMouseMove]").removeAttr("onMouseMove");
			$("[onMouseOut]").removeAttr("onMouseOut");
			$("[onMouseOver]").removeAttr("onMouseOver");
			$("[onMouseUp]").removeAttr("onMouseUp");
			$("[onMove]").removeAttr("onMove");
			$("[onReset]").removeAttr("onReset");
			$("[onResize]").removeAttr("onResize");
			$("[onSelect]").removeAttr("onSelect");
			$("[onSubmit]").removeAttr("onSubmit");
			$("[onUnload]").removeAttr("onUnload");
		}
	}
}
function loaded() {
	$('body').unbind('DOMNodeInserted.ScriptSafe');
	$('body').bind('DOMNodeInserted.ScriptSafe', block);
	if (SETTINGS['LISTSTATUS'] == 1 || (SETTINGS['LISTSTATUS'] == -1 && SETTINGS['MODE'] == 'block')) {
		ScriptSafe();
	}
}
function getElSrc(el) {
	switch (el.nodeName.toUpperCase()) {
		case 'OBJECT': // credit: NotScripts
			if (el.codeBase) codeBase = el.codeBase;	
			if (el.data) {
				if (reStartWProtocol.test(el.data)) return el.data;
				else return codeBase;				
			}
			var plist = el.getElementsByTagName('param');
			for (var i=0; i < plist.length; i++) {
				var paramName = plist[i].name.toLowerCase();
				if (paramName === 'movie' || paramName === 'src' || paramName === 'codebase' || paramName === 'data')
					return plist[i].value;
				else if (paramName === 'code' || paramName === 'url')
					return plist[i].value;
			}
			return window.location.href;
			break;
		case 'EMBED': // credit: NotScripts
			var codeBase = window.location.href;
			if (el.codeBase) codeBase = el.codeBase;
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
				else return codeBase;
			}
			if (el.data) {
				if (reStartWProtocol.test(el.data)) return el.data;
				else return codeBase;				
			}
			if (el.code) {
				if (reStartWProtocol.test(el.code)) return el.code;
				else return codeBase;			
			}
			return window.location.href;
			break;
		case 'APPLET':
			return el.code;
			break;
		case 'A':
			return el.href;
			break;
		case 'PARAM':
			return el.value;
			break;
		default:
			return el.src;
			break;
	}
}
function injectAnon(f) { // credit: NotScripts - eventually phase out
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = "(" + f + ")();";
    document.documentElement.appendChild(script);
}
function mitigate() { // credit: NotScripts - eventually phase out
	injectAnon(function(){
		for (var i in window) {
			try {
				var jsType = typeof window[i];
				switch (jsType.toUpperCase()) {					
					case "FUNCTION": 
						if (window[i] !== window.location) {
							if (window[i] === window.open || (window.showModelessDialog && window[i] === window.showModelessDialog))
								window[i] = function(){return true;};
							else if (window[i] === window.onbeforeunload)
								window.onbeforeunload = null;
							else if (window[i] === window.onunload)
								window.onunload = null;								
							else
								window[i] = function(){return "";};
						}
						break;							
				}			
			} catch(err) {}		
		}
		for (var i in document) {
			try {
				var jsType = typeof document[i];
				switch (jsType.toUpperCase()) {					
					case "FUNCTION":
						document[i] = function(){return "";};
						break;					
				}			
			} catch(err) {}		
		}
		try {
			eval = function(){return "";};				
			unescape = function(){return "";};
			String = function(){return "";};
			parseInt = function(){return "";};
			parseFloat = function(){return "";};
			Number = function(){return "";};
			isNaN = function(){return "";};
			isFinite = function(){return "";};
			escape = function(){return "";};
			encodeURIComponent = function(){return "";};
			encodeURI = function(){return "";};
			decodeURIComponent = function(){return "";};
			decodeURI = function(){return "";};
			Array = function(){return "";};
			Boolean = function(){return "";};
			Date = function(){return "";};
			Math = function(){return "";};
			Number = function(){return "";};
			RegExp = function(){return "";};
			var oNav = navigator;
			navigator = function(){return "";};
			oNav = null;			
		} catch(err) {}
	});
}
function clearUnloads() { // credit: NotScripts
	clearTimeout(timer);
	var keepGoing = (window.onbeforeunload || window.onunload);
	window.onbeforeunload = null;
	window.onunload = null;
	if (keepGoing) timer = setTimeout("clearUnloads()", 5000);
}
function saveBeforeloadEvent(e) {
	savedBeforeloadEvents.push(e);
}
document.addEventListener("beforeload", saveBeforeloadEvent, true);
if (window.self != window.top) iframe = 1;
chrome.extension.sendRequest({reqtype: "get-settings", iframe: iframe}, function(response) {
    document.removeEventListener("beforeload", saveBeforeloadEvent, true);
	if (typeof response === 'object' && response.status == 'true') {
		SETTINGS['MODE'] = response.mode;
		SETTINGS['ANNOYANCES'] = response.annoyances;
		SETTINGS['ANNOYANCESMODE'] = response.annoyancesmode;
		SETTINGS['ANTISOCIAL'] = response.antisocial;
		SETTINGS['WHITELIST'] = JSON.parse(response.whitelist);
		SETTINGS['BLACKLIST'] = JSON.parse(response.blacklist);	
		SETTINGS['WHITELISTSESSION'] = JSON.parse(response.whitelistSession);
		SETTINGS['BLACKLISTSESSION'] = JSON.parse(response.blackListSession);
		SETTINGS['SCRIPT'] = response.script;
		SETTINGS['PRESERVESAMEDOMAIN'] = response.preservesamedomain;
		SETTINGS['EXPERIMENTAL'] = response.experimental;
		if (SETTINGS['EXPERIMENTAL'] == '0' && (((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] == 'true' && domainCheck(window.location.href.toLowerCase(), 1) == '1')) && response.enable == 'true' && SETTINGS['SCRIPT'] == 'true' && domainCheck(window.location.href.toLowerCase(), 1) != '0') || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheck(window.location.href.toLowerCase(), 1) != '0')) && baddies(window.location.hostname.toLowerCase(), SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddies(window.location.hostname.toLowerCase(), SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '2'))))
			mitigate();
		SETTINGS['LISTSTATUS'] = domainCheck(window.location.href.toLowerCase());
		SETTINGS['NOSCRIPT'] = response.noscript;
		SETTINGS['OBJECT'] = response.object;
		SETTINGS['APPLET'] = response.applet;
		SETTINGS['EMBED'] = response.embed;
		SETTINGS['IFRAME'] = response.iframe;
		SETTINGS['FRAME'] = response.frame;
		SETTINGS['AUDIO'] = response.audio;
		SETTINGS['VIDEO'] = response.video;
		SETTINGS['IMAGE'] = response.image;
		SETTINGS['WEBBUGS'] = response.webbugs;
		SETTINGS['LINKTARGET'] = response.linktarget;
		SETTINGS['REFERRER'] = response.referrer;
		document.addEventListener("beforeload", block, true);
		for (var i = 0; i < savedBeforeloadEvents.length; i++)
			block(savedBeforeloadEvents[i]);
	}
	delete savedBeforeloadEvents;
});
