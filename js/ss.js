// ScriptSafe by Andrew
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
	"SCRIPT": 'true',
	"NOSCRIPT": 'true',
	"OBJECT": 'true',
	"APPLET": 'true',
	"EMBED": 'true',
	"IFRAME": 'true',
	"FRAME": 'true',
	"AUDIO": 'true',
	"VIDEO": 'true',
	"IMAGE": 'false',
	"CANVAS": 'false',
	"CANVASFONT": 'false',
	"AUDIOBLOCK": 'false',
	"BATTERY": 'false',
	"WEBGL": 'false',
	"KEYBOARD": 'false',
	"WEBRTCDEVICE": 'false',
	"GAMEPAD": 'false',
	"ANNOYANCES": 'false',
	"ANNOYANCESMODE": "relaxed",
	"ANTISOCIAL": 'false',
	"PRESERVESAMEDOMAIN": 'false',
	"WEBBUGS": 'true',
	"LINKTARGET": "off",
	"EXPERIMENTAL": "0",
	"REFERRER": 'true',
	"PARANOIA": 'true',
	"CLIPBOARD": 'false'
};
document.addEventListener("beforeload", saveBeforeloadEvent, true); // eventually remove
if (window.self != window.top) iframe = 1;
chrome.extension.sendRequest({reqtype: "get-settings", iframe: iframe}, function(response) {
    document.removeEventListener("beforeload", saveBeforeloadEvent, true); // eventually remove
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
		SETTINGS['CANVAS'] = response.canvas;
		SETTINGS['CANVASFONT'] = response.canvasfont;
		SETTINGS['AUDIOBLOCK'] = response.audioblock;
		SETTINGS['BATTERY'] = response.battery;
		SETTINGS['WEBGL'] = response.webgl;
		SETTINGS['WEBRTCDEVICE'] = response.webrtcdevice;
		SETTINGS['GAMEPAD'] = response.gamepad;
		SETTINGS['KEYBOARD'] = response.keyboard;
		if (SETTINGS['CANVAS'] != 'false') {
			if (SETTINGS['CANVAS'] == 'blank') canvasBlank();
			else if (SETTINGS['CANVAS'] == 'random') canvasRandom();
			else if (SETTINGS['CANVAS'] == 'block') canvasBlock();
		}
		if (SETTINGS['CANVASFONT'] == 'true') canvasFontBlock();
		if (SETTINGS['AUDIOBLOCK'] == 'true') audioBlock();
		if (SETTINGS['BATTERY'] == 'true') batteryBlock();
		if (SETTINGS['WEBGL'] == 'true') webglBlock();
		if (SETTINGS['WEBRTCDEVICE'] == 'true') webrtcDeviceBlock();
		if (SETTINGS['GAMEPAD'] == 'true') gamepadBlock();
		SETTINGS['WEBBUGS'] = response.webbugs;
		SETTINGS['LINKTARGET'] = response.linktarget;
		SETTINGS['REFERRER'] = response.referrer;
		SETTINGS['PARANOIA'] = response.paranoia;
		SETTINGS['CLIPBOARD'] = response.clipboard;
		$(document).ready(function() {
			loaded();
			if (SETTINGS['KEYBOARD'] == 'true') {
				$('div, :input').keyup(randomDelay);
				$('div, :input').keydown(randomDelay);
			}
			if (SETTINGS['CLIPBOARD'] == 'true') {
				clipboardProtect(window);
				clipboardProtect(document);
			}
		});
		document.addEventListener("beforeload", block, true); // eventually remove
		for (var i = 0; i < savedBeforeloadEvents.length; i++) // eventually remove
			block(savedBeforeloadEvents[i]); // eventually remove
	}
	delete savedBeforeloadEvents; // eventually remove
});
function clipboardProtect(el) {
    el.oncontextmenu = null;
    el.onselectstart = null;
    el.onmousedown = null;
    el.oncopy = null;
    el.oncut = null;
    el.onpaste = null;
	el.addEventListener('contextmenu', function(e) { e.returnValue = true; });
	el.addEventListener('selectstart', function(e) { e.returnValue = true; });
	el.addEventListener('mousedown', function(e) { e.returnValue = true; });
	el.addEventListener('copy', function(e) { e.returnValue = true; });
	el.addEventListener('cut', function(e) { e.returnValue = true; });
}
function loaded() {
	var obtarget = document.querySelector("body");
	var obconfig = { childList: true, subtree : true, attributes: false, characterData : false };
	ScriptSafe();
	new MutationObserver(ScriptSafe).observe(obtarget, obconfig);
}
function ScriptSafe() {
	if (SETTINGS['LINKTARGET'] != 'off') {
		var linktrgt;
		if (SETTINGS['LINKTARGET'] == 'same') linktrgt = '_self';
		else if (SETTINGS['LINKTARGET'] == 'new') linktrgt = '_blank';
		$("a[target!='"+linktrgt+"']").attr("target", linktrgt);
	}
	if (SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) {
		$("a[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (thirdParty(elSrc)) { $(this).attr("rel","noreferrer"); } $(this).attr("data-ss"+timestamp,'1'); });
	}
	if (SETTINGS['CANVAS'] != 'false') {
		$("canvas.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Canvas Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['CANVASFONT'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Canvas Font Access'}); $(this).remove(); });
	}
	if (SETTINGS['AUDIOBLOCK'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Audio Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['WEBGL'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'WebGL Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['BATTERY'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Battery Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['WEBRTCDEVICE'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Device Enumeration'}); $(this).remove(); });
	}
	if (SETTINGS['GAMEPAD'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Gamepad Enumeration'}); $(this).remove(); });
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
	/* Fallback Inline Script Handling */
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
function removeMedia($el) {
	$el[0].pause();
	$el[0].src = '';
	$el.children('source').prop('src', '');
	$el.load();
	//$el.hide();
	$el.remove().length = 0;
};
function getElSrc(el) {
	var reStartWProtocol = /^[^\.\/:]+:\/\//i; // credit: NotScripts
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
function randomDelay() {
	var zzz = (Date.now() + (Math.floor(Math.random() * 100) + 10));
	while (Date.now() < zzz) {};
}
function canvasBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var fakecanvas = scope.document.createElement('canvas');
			fakecanvas.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas';
			var b = scope.HTMLCanvasElement;
			b.prototype.toDataURL = function() {
				fakecanvas.title = 'toDataURL';
				document.body.appendChild(fakecanvas);
				return false;
			};
			b.prototype.toBlob = function() {
				fakecanvas.title = 'toBlob';
				document.body.appendChild(fakecanvas);
				return false;
			};
			var c = scope.CanvasRenderingContext2D;
			c.prototype.getImageData = function() {
				fakecanvas.title = 'getImageData';
				document.body.appendChild(fakecanvas);
				return false;
			}
			c.prototype.getLineDash = function() {
				fakecanvas.title = 'getLineDash';
				document.body.appendChild(fakecanvas);
				return false;
			}
			var d = scope.WebGLRenderingContext;
			d.prototype.readPixels = function() {
				fakecanvas.title = 'readPixels';
				document.body.appendChild(fakecanvas);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function canvasBlank() {
	injectAnon(function(){
		function processFunctions(scope) {
			var fakecanvas = scope.document.createElement('canvas');
			fakecanvas.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas';
			var b = scope.HTMLCanvasElement;
			var origToDataURL = b.prototype.toDataURL;
			var origToBlob = b.prototype.toBlob;
			b.prototype.toDataURL = function() {
				fakecanvas.title = 'toDataURL';
				fakecanvas.width = this.width;
				fakecanvas.height = this.height;
				document.body.appendChild(fakecanvas);
				return origToDataURL.apply(fakecanvas, arguments);
			};
			b.prototype.toBlob = function() {
				fakecanvas.title = 'toBlob';
				fakecanvas.width = this.width;
				fakecanvas.height = this.height;
				document.body.appendChild(fakecanvas);
				return origToBlob.apply(fakecanvas, arguments);
			};
			var c = scope.CanvasRenderingContext2D;
			var origGetImageData = c.prototype.getImageData;
			c.prototype.getImageData = function() {
				fakecanvas.title = 'getImageData';
				fakecanvas.width = this.width;
				fakecanvas.height = this.height;
				document.body.appendChild(fakecanvas);
				return origGetImageData.apply(fakecanvas.getContext('2d'), arguments);
			}
			var origGetLineDash = c.prototype.getLineDash;
			c.prototype.getLineDash = function() {
				fakecanvas.title = 'getLineDash';
				fakecanvas.width = this.width;
				fakecanvas.height = this.height;
				document.body.appendChild(fakecanvas);
				return origGetLineDash.apply(fakecanvas.getContext('2d'), [0, 0]);
			}
			var d = scope.WebGLRenderingContext;
			var origReadPixels = d.prototype.readPixels;
			d.prototype.readPixels = function() {
				fakecanvas.title = 'readPixels';
				fakecanvas.width = this.width;
				fakecanvas.height = this.height;
				document.body.appendChild(fakecanvas);
				return origReadPixels.apply(fakecanvas.getContext('webgl'), arguments);
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function canvasRandom() {
	injectAnon(function(){
		function processFunctions(scope) {
			var fakecanvas = scope.document.createElement('canvas');
			var fakewidth = fakecanvas.width = Math.floor(Math.random() * 999) + 1;
			var fakeheight = fakecanvas.height = Math.floor(Math.random() * 999) + 1;
			fakecanvas.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas';
			var b = scope.HTMLCanvasElement;
			var origToDataURL = b.prototype.toDataURL;
			var origToBlob = b.prototype.toBlob;
			b.prototype.toDataURL = function() {
				fakecanvas.title = 'toDataURL';
				document.body.appendChild(fakecanvas);
				return origToDataURL.apply(fakecanvas, arguments);
			};
			b.prototype.toBlob = function() {
				fakecanvas.title = 'toBlob';
				document.body.appendChild(fakecanvas);
				return origToBlob.apply(fakecanvas, arguments);
			};
			var c = scope.CanvasRenderingContext2D;
			var origGetImageData = c.prototype.getImageData;
			c.prototype.getImageData = function() {
				fakecanvas.title = 'getImageData';
				document.body.appendChild(fakecanvas);
				return origGetImageData.apply(fakecanvas.getContext('2d'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1]);
			}
			var origGetLineDash = c.prototype.getLineDash;
			c.prototype.getLineDash = function() {
				fakecanvas.title = 'getLineDash';
				document.body.appendChild(fakecanvas);
				return origGetLineDash.apply(fakecanvas.getContext('2d'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1]);
			}
			var d = scope.WebGLRenderingContext;
			var origReadPixels = d.prototype.readPixels;
			d.prototype.readPixels = function() {
				fakecanvas.title = 'readPixels';
				document.body.appendChild(fakecanvas);
				return origReadPixels.apply(fakecanvas.getContext('webgl'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, arguments[4], arguments[5], arguments[6]]);
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function audioBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio';
			var b = scope.AudioBuffer;
			b.prototype.copyFromChannel = function() {
				triggerblock.title = 'copyFromChannel';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.prototype.getChannelData = function() {
				triggerblock.title = 'getChannelData';
				document.body.appendChild(triggerblock);
				return false;
			}
			var c = scope.AnalyserNode;
			c.prototype.getFloatFrequencyData = function() {
				triggerblock.title = 'getFloatFrequencyData';
				document.body.appendChild(triggerblock);
				return false;
			}
			c.prototype.getByteFrequencyData = function() {
				triggerblock.title = 'getByteFrequencyData';
				document.body.appendChild(triggerblock);
				return false;
			}
			c.prototype.getFloatTimeDomainData = function() {
				triggerblock.title = 'getFloatTimeDomainData';
				document.body.appendChild(triggerblock);
				return false;
			}
			c.prototype.getByteTimeDomainData = function() {
				triggerblock.title = 'getByteTimeDomainData';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function canvasFontBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont';
			var b = scope.CanvasRenderingContext2D;
			b.prototype.measureText = function() {
				triggerblock.title = 'measureText';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function batteryBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery';
			var b = scope.navigator;
			b.getBattery = function() {
				triggerblock.title = 'getBattery';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function webrtcDeviceBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc';
			var b = scope.MediaStreamTrack;
			b.getSources = function() {
				triggerblock.title = 'getSources';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.getMediaDevices = function() {
				triggerblock.title = 'getMediaDevices';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function webglBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl';
			var b = scope.WebGLRenderingContext;
			b.getSupportedExtensions = function() {
				triggerblock.title = 'getSupportedExtensions';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.getParameter = function() {
				triggerblock.title = 'getParameter';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.getContextAttributes = function() {
				triggerblock.title = 'getContextAttributes';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.getShaderPrecisionFormat = function() {
				triggerblock.title = 'getShaderPrecisionFormat';
				document.body.appendChild(triggerblock);
				return false;
			}
			b.getExtension = function() {
				triggerblock.title = 'getExtension';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function gamepadBlock() {
	injectAnon(function(){
		function processFunctions(scope) {
			var triggerblock = scope.document.createElement('div');
			triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad';
			var b = scope.navigator;
			b.getGamepads = function() {
				triggerblock.title = 'getGamepads';
				document.body.appendChild(triggerblock);
				return false;
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('://') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	});
}
function injectAnon(f) {
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = "(" + f + ")();";
    document.documentElement.appendChild(script);
}
/* Fallback Inline Script Handling (if Chrome doesn't support chrome.webRequest API) / */
function mitigate() { // credit: NotScripts
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
/* / Fallback Inline Script Handling */
/* Deprecated beforeload Handling / */
function saveBeforeloadEvent(e) {
	savedBeforeloadEvents.push(e);
}
function block(event) {
	var el = event.target;
	var elSrc = getElSrc(el);
	if (!elSrc) return;
	var elType = el.nodeName.toUpperCase();
	if (!(elType == "A" || elType == "IFRAME" || elType == "FRAME" || (elType == "SCRIPT" && SETTINGS['EXPERIMENTAL'] == '0') || elType == "EMBED" || elType == "OBJECT" || elType == "IMG")) return;
	elSrc = elSrc.toLowerCase();
	var absoluteUrl = relativeToAbsoluteUrl(elSrc);
	if (absoluteUrl.substr(0,4) != 'http') return;
	var thirdPartyCheck;
	var elementStatusCheck;
	var domainCheckStatus;
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
	if (elementStatusCheck && (
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
					|| (elType == "A" && (SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')))
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
			(SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
	))) {
			if ((SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0')) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) {
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
/* / Deprecated beforeload Handling */