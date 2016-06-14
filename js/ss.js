// Credits and ideas: NotScripts, AdBlock Plus for Chrome, Ghostery, KB SSL Enforcer
var savedBeforeloadEvents = new Array();
var timer;
var iframe = 0;
var timestamp = Math.round(new Date().getTime()/1000.0);
// initialize settings object with default settings (that are overwritten by the actual user-set values later on)
var SETTINGS = {
	"MODE": "block",
	"LISTSTATUS": 'false',
	"DOMAINSTATUS": '-1',
	"WHITELIST": '',
	"BLACKLIST": '',
	"WHITELISTSESSION": '',
	"BLACKLISTSESSION": '',
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
	"REFERRER": true,
	"PARANOIA": 'true'
};
const reStartWProtocol = /^[^\.\/:]+:\/\//i; // credit: NotScripts
function block(event) {
	var el = event.target;
	var elSrc = getElSrc(el);
	if (!elSrc) return;
	var elType = el.nodeName.toUpperCase();
	if (!(elType == "A" || elType == "IFRAME" || elType == "FRAME" || (elType == "SCRIPT" && SETTINGS['EXPERIMENTAL'] == '0') || elType == "EMBED" || elType == "OBJECT" || elType == "IMG")) return;
	elSrc = elSrc.toLowerCase();
	var thirdPartyCheck;
	var elementStatusCheck;
	var domainCheckStatus;
	var absoluteUrl = relativeToAbsoluteUrl(elSrc);
	var elWidth = $(el).attr('width');
	var elHeight = $(el).attr('height');
	var elStyle = $(el).attr('style');
	var baddiesCheck = baddies(absoluteUrl, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']);
	if (SETTINGS['DOMAINSTATUS'] == '1' || (SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true' && SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) {
		elementStatusCheck = true;
		thirdPartyCheck = true;
		domainCheckStatus = '1';
	} else {
		domainCheckStatus = domainCheck(absoluteUrl, 1);
		var elementDomain = extractDomainFromURL(absoluteUrl);
		if ((domainCheckStatus == '0' && !(SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true')) || (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' && elementDomain == window.location.hostname)) thirdPartyCheck = false;
		else if (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' && elementDomain != window.location.hostname) thirdPartyCheck = true;
		else thirdPartyCheck = thirdParty(absoluteUrl);
		if ((SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && SETTINGS['MODE'] == 'block'))) || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	if (absoluteUrl.substr(0,4) == 'http' && elementStatusCheck && (
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
					|| (elType == "A" && (SETTINGS['REFERRER'] == 'everywhere' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')))
				)
				&& (
					(SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck))
					|| SETTINGS['PRESERVESAMEDOMAIN'] == 'false'
				)
				
			)
		)
		|| (
			SETTINGS['WEBBUGS'] == 'true'
			&& (elType == "IMG" || elType == "IFRAME" ||  elType == "FRAME" || elType == "EMBED" || elType == "OBJECT")
			&& (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
			&& (
				(typeof elWidth !== 'undefined' && elWidth <= 5 && typeof elHeight !== 'undefined' && elHeight <= 5)
				|| (typeof elStyle !== 'undefined' && elStyle.match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i))
			)
		)
		|| (
			(SETTINGS['REFERRER'] == 'everywhere' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
	))) {
			if ((SETTINGS['REFERRER'] == 'everywhere' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) {
				$(el).attr("rel","noreferrer");
			} else {
				event.preventDefault();
				if (SETTINGS['WEBBUGS'] == 'true' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck) && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "IMG") && ((typeof elWidth !== 'undefined' && elWidth <= 5 && typeof elHeight !== 'undefined' && elHeight <= 5) || (typeof elStyle !== 'undefined' && elStyle.match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i)))) {
					elType = "WEBBUG";
				}
				chrome.extension.sendRequest({reqtype: "update-blocked", src: absoluteUrl, node: elType});
				if (elType == 'VIDEO' || elType == 'AUDIO') removeMedia($el);
				else $(el).remove();
			}
		} else {
			if (SETTINGS['EXPERIMENTAL'] == '0' && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "SCRIPT")) {
				chrome.extension.sendRequest({reqtype: "update-allowed", src: absoluteUrl, node: elType});
			}
		}
}
function postLoadCheck(elSrc) {
	if (elSrc.substring(0,4) != 'http') return false;
	var domainCheckStatus;
	var thirdPartyCheck;
	var elementStatusCheck;
	var baddiesCheck = baddies(elSrc, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL'], 2);
	if (SETTINGS['DOMAINSTATUS'] == '1' || (SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true' && SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) {
		elementStatusCheck = true;
		thirdPartyCheck = true;
	} else {
		domainCheckStatus = domainCheck(elSrc, 1);
		var elementDomain = extractDomainFromURL(elSrc);
		if ((domainCheckStatus == '0' && !(SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true')) || (SETTINGS['preservesamedomain'] == 'strict' && elementDomain == window.location.hostname)) thirdPartyCheck = false;
		else if (SETTINGS['preservesamedomain'] == 'strict' && elementDomain != window.location.hostname) thirdPartyCheck = true;
		else thirdPartyCheck = thirdParty(elSrc);
		if ((SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && SETTINGS['MODE'] == 'block'))) || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	if (elementStatusCheck && ((SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || SETTINGS['PRESERVESAMEDOMAIN'] == 'false'))
		return true;
	return false;
}
function domainCheck(domain, req) {
	if (!domain) return '-1';
	if (req === undefined) {
		var baddiesCheck = baddies(domain, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']);
		if ((SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'strict' && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2')) return '1';
	}
	var domainname = extractDomainFromURL(domain);
	if (req != '2') {
		if (SETTINGS['MODE'] == 'block' && in_array(domainname, SETTINGS['WHITELISTSESSION'])) return '0';
		if (SETTINGS['MODE'] == 'allow' && in_array(domainname, SETTINGS['BLACKLISTSESSION'])) return '1';
	}
	if (in_array(domainname, SETTINGS['WHITELIST'])) return '0';
	if (in_array(domainname, SETTINGS['BLACKLIST'])) return '1';
	if (req === undefined) {
		if (SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'relaxed' && baddiesCheck) return '1';
	}
	return '-1';
}
function relativeToAbsoluteUrl(url) { // credit: NotScripts
	if (!url || url.indexOf('://') != -1)
		return url;
	if (url[0] == '/' && url[1] == '/')
		return document.location.protocol + url;
	if (url[0] == '/')
		return document.location.protocol + "//" + window.location.hostname + url;
	var base = document.baseURI.match(/.+\//);
	if (!base)
		return document.baseURI + "/" + url;
	return base[0] + url;
}
function blockreferrer() {
	$("a[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (thirdParty(elSrc)) { $(this).attr("rel","noreferrer"); } $(this).attr("data-ss"+timestamp,'1'); });
}
function removeMedia($el) {
	$el[0].pause();
	$el[0].src = '';
	$el.children('source').prop('src', '');
	$el.load();
	//$el.hide();
	$el.remove().length = 0;
};
function ScriptSafe() {
	if (SETTINGS['LINKTARGET'] != 'off') {
		var linktrgt;
		if (SETTINGS['LINKTARGET'] == 'same') linktrgt = '_self';
		else if (SETTINGS['LINKTARGET'] == 'new') linktrgt = '_blank';
		$("a[target!='"+linktrgt+"']").attr("target", linktrgt);
	}
	if (SETTINGS['NOSCRIPT'] == 'true' && SETTINGS['LISTSTATUS'] == 'true') {
		$("noscript").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: $(this).html(), node: 'NOSCRIPT'}); $(this).remove(); });
	}
	if (SETTINGS['APPLET'] == 'true') $("applet[data-ss"+timestamp+"!='1']").each(function() { var elSrc = $(this).attr('code'); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'APPLET'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'APPLET'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['VIDEO'] == 'true') $("video[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'VIDEO'}); removeMedia($(this)); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'VIDEO'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['AUDIO'] == 'true') $("audio[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'AUDIO'}); removeMedia($(this)); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'AUDIO'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	/* handled by background page, but clean up elements */
	if (SETTINGS['IFRAME'] == 'true') $("iframe[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { $(this).remove(); } else { $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['OBJECT'] == 'true') $("object[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { $(this).remove(); } else { $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['EMBED'] == 'true') $("embed[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { $(this).remove(); } else { $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['IMAGE'] == 'true') $("picture[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { $(this).remove(); } else { $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['IMAGE'] == 'true') $("img[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { $(this).remove(); } else { $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == '0') {
		clearUnloads();
		$("script[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc.toLowerCase()); if (postLoadCheck(elSrc)) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'SCRIPT'}); $(this).remove(); } else { if (elSrc.substr(0,4) == 'http') { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: "SCRIPT"}); $(this).attr("data-ss"+timestamp,'1'); } } } });
		if ((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && SETTINGS['DOMAINSTATUS'] == '1'))) {
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
	ScriptSafe();
	$('body').unbind('DOMNodeInserted.ScriptSafe');
	$('body').bind('DOMNodeInserted.ScriptSafe', ScriptSafe);
	if (SETTINGS['REFERRER'] == 'everywhere' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) {
		$('body').unbind('DOMNodeInserted.ScriptSafeReferrer');
		$('body').bind('DOMNodeInserted.ScriptSafeReferrer', blockreferrer);
		blockreferrer();
	}
}
function getElSrc(el) {
	switch (el.nodeName.toUpperCase()) {
		case 'PICTURE':
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].srcset) return plist[i].srcset;
			}
			plist = el.getElementsByTagName('img');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
		case 'AUDIO':
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
			}
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
		case 'VIDEO':
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
			}
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
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
		case 'A':
			return el.href;
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
		SETTINGS['WHITELIST'] = response.whitelist;
		SETTINGS['BLACKLIST'] = response.blacklist;	
		SETTINGS['WHITELISTSESSION'] = response.whitelistSession;
		SETTINGS['BLACKLISTSESSION'] = response.blackListSession;
		SETTINGS['SCRIPT'] = response.script;
		SETTINGS['PRESERVESAMEDOMAIN'] = response.preservesamedomain;
		SETTINGS['EXPERIMENTAL'] = response.experimental;
		SETTINGS['DOMAINSTATUS'] = domainCheck(window.location.href, 1);
		if (SETTINGS['EXPERIMENTAL'] == '0' && (((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && SETTINGS['DOMAINSTATUS'] == '1')) && response.enable == 'true' && SETTINGS['SCRIPT'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0') || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && SETTINGS['DOMAINSTATUS'] != '0')) && baddies(window.location.hostname, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddies(window.location.hostname, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '2'))))
			mitigate();
		SETTINGS['LISTSTATUS'] = response.enable;
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
		SETTINGS['PARANOIA'] = response.paranoia;
		$(document).ready(function() {
			loaded();
		});
		document.addEventListener("beforeload", block, true);
		for (var i = 0; i < savedBeforeloadEvents.length; i++)
			block(savedBeforeloadEvents[i]);
	}
	delete savedBeforeloadEvents;
});
