// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
// Credits and ideas: NotScripts, AdBlock Plus for Chrome, Ghostery, KB SSL Enforcer
'use strict';
var version = '1.0.9.3';
var requestTypes, synctimer, recentstimer, reenabletimer, useragentinterval, blackList, whiteList, distrustList, trustList, sessionBlackList, sessionWhiteList, locale;
var langs = {
	'en_US': 'English (US)',
	'en_GB': 'English (UK)',
	'zh_CN': 'Chinese (Simplified)',
	'zh_TW': 'Chinese (Traditional)',
	'cs': 'Czech',
	'nl': 'Dutch',
	'fr': 'French',
	'de': 'German',
	'hu': 'Hungarian',
	'it': 'Italian',
	'ja': 'Japanese',
	'ko': 'Korean',
	'lv': 'Latvian',
	'pl': 'Polish',
	'ro': 'Romanian',
	'ru': 'Russian',
	'es': 'Spanish',
	'sv': 'Swedish'
}
var fpTypes = ['fpCanvas', 'fpCanvasFont', 'fpAudio', 'fpWebGL', 'fpBattery', 'fpDevice', 'fpGamepad', 'fpWebVR', 'fpBluetooth', 'fpClientRectangles', 'fpClipboard', 'fpBrowserPlugins'];
var fpLists = [];
var fpListsSession = [];
var popup = [];
var recentlog = [];
recentlog['allowed'] = [];
recentlog['blocked'] = [];
var changed = false;
var ITEMS = {};
var experimental = 0;
var storageapi = false;
var webrtcsupport = false;
var updated = false;
var userAgent = '';
function refreshRequestTypes() {
	clearRecents();
	genUserAgent(1);
	requestTypes = ['main_frame'];
	if (localStorage['iframe'] == 'true' || localStorage['frame'] == 'true')
		requestTypes.push('sub_frame');
	if (localStorage['object'] == 'true' || localStorage['embed'] == 'true')
		requestTypes.push('object');
	if (localStorage['script'] == 'true')
		requestTypes.push('script');
	if (localStorage['image'] == 'true' || localStorage['webbugs'] == 'true')
		requestTypes.push('image');
	if (localStorage['xml'] == 'true' || localStorage['xml'] == 'all')
		requestTypes.push('xmlhttprequest');
}
function initWebRTC() {
	if (!webrtcsupport) return;
	if (localStorage['webrtc'] != 'off') {
		chrome.privacy.network.webRTCIPHandlingPolicy.set({
			value: localStorage['webrtc'],
		});
	} else {
		chrome.privacy.network.webRTCIPHandlingPolicy.set({
			value: 'default',
		});
	}
}
function getWebRTC() {
	return webrtcsupport;
}
function testWebRTC(rtcstatus) {
	document.getElementById('webrtc').remove();
	webrtcsupport = rtcstatus;
}
function checkWebRTC() {
	if (typeof chrome.privacy.network.webRTCIPHandlingPolicy === 'undefined') return false;
	var doc = document.getElementById('webrtc').contentWindow.document;
	doc.open();
	doc.write('<script src="../js/webrtctest.js"></script>');
	doc.close();
}
function mitigate(req) {
	if (localStorage["enable"] == "false" || (localStorage['useragentspoof'] == 'off' && localStorage['cookies'] == 'false' && localStorage['referrerspoof'] == 'off')) {
		return;
	}
	for (var i = 0, forcount=req.requestHeaders.length; i < forcount; i++) {
		if (req.requestHeaders[i].name == 'User-Agent' || req.requestHeaders[i].name == 'Referer' || req.requestHeaders[i].name == 'Cookie') {
			switch (req.requestHeaders[i].name) {
				case 'Cookie':
					if (localStorage['cookies'] == 'true' && baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial']))
						req.requestHeaders[i].value = '';
					break;
				case 'Referer':
					if (localStorage['referrerspoof'] != 'off' && (localStorage['referrerspoofdenywhitelisted'] == 'true' || enabled(req.url) == 'true')) {
						if (localStorage['referrerspoof'] == 'same')
							req.requestHeaders[i].value = req.url;
						else if (localStorage['referrerspoof'] == 'domain')
							req.requestHeaders[i].value = req.url.split("//")[0] + '//' + req.url.split("/")[2];
						else
							req.requestHeaders[i].value = localStorage['referrerspoof'];
					}
					break;
				case 'User-Agent':
					if (localStorage['useragentspoof'] != 'off' && (localStorage['uaspoofallow'] == 'true' || enabled(req.url) == 'true')) {
						if (!userAgent || localStorage['useragentinterval'] == 'request') genUserAgent();
						if (userAgent) req.requestHeaders[i].value = userAgent;
					}
					break;
			}
		}
	}
	return { requestHeaders: req.requestHeaders };
}
function genUserAgent(force) {
	var os;
	if (localStorage['useragentspoof'] == 'custom') {
		var userAgents = JSON.parse(localStorage['useragent']);
		if (userAgents) {
			var uaCount = userAgents.length;
			if (uaCount == 1) userAgent = userAgents[0];
			else {
				window.clearInterval(useragentinterval);
				if (localStorage['useragentinterval'] == 'off') userAgent = userAgents[0]; // use only first user agent string if set to off
				else {
					if (localStorage['useragentinterval'] == 'interval') {
						useragentinterval = window.setInterval(function() { genUserAgent(1) }, localStorage['useragentintervalmins']*60*1000);
						if (force) userAgent = userAgents[Math.floor(Math.random() * uaCount)];
					} else if (localStorage['useragentinterval'] == 'request') {
						userAgent = userAgents[Math.floor(Math.random() * uaCount)];
					}
				}
			}
		}
	} else {
		if (localStorage['useragentspoof_os'] == 'w10') os = 'Windows NT 10.0';
		else if (localStorage['useragentspoof_os'] == 'w81') os = 'Windows NT 6.3';
		else if (localStorage['useragentspoof_os'] == 'w8') os = 'Windows NT 6.2';
		else if (localStorage['useragentspoof_os'] == 'w7') os = 'Windows; U; Windows NT 6.1';
		else if (localStorage['useragentspoof_os'] == 'wv') os = 'Windows; U; Windows NT 6.0';
		else if (localStorage['useragentspoof_os'] == 'w2k3') os = 'Windows; U; Windows NT 5.2';
		else if (localStorage['useragentspoof_os'] == 'wxp') os = 'Windows; U; Windows NT 5.1';
		else if (localStorage['useragentspoof_os'] == 'w98') os = 'Windows; U; Windows 98';
		else if (localStorage['useragentspoof_os'] == 'w95') os = 'Windows; U; Windows 95';
		else if (localStorage['useragentspoof_os'] == 'linux64') os = 'X11; U; Linux x86_64';
		else if (localStorage['useragentspoof_os'] == 'linux32') os = 'X11; U; Linux x86_32';
		else if (localStorage['useragentspoof_os'] == 'machighsierra') os = 'Macintosh; U; Intel Mac OS X 10_13';
		else if (localStorage['useragentspoof_os'] == 'macsierra') os = 'Macintosh; U; Intel Mac OS X 10_12_2';
		else if (localStorage['useragentspoof_os'] == 'macelcapitan') os = 'Macintosh; U; Intel Mac OS X 10_11_6';
		else if (localStorage['useragentspoof_os'] == 'macyosemite') os = 'Macintosh; U; Intel Mac OS X 10_10_5';
		else if (localStorage['useragentspoof_os'] == 'macmavericks') os = 'Macintosh; U; Intel Mac OS X 10_9_5';
		else if (localStorage['useragentspoof_os'] == 'macmountainlion') os = 'Macintosh; U; Intel Mac OS X 10_8_5';
		else if (localStorage['useragentspoof_os'] == 'maclion') os = 'Macintosh; U; Intel Mac OS X 10_7_5';
		else if (localStorage['useragentspoof_os'] == 'macsnow') os = 'Macintosh; U; Intel Mac OS X 10_6_8';
		else if (localStorage['useragentspoof_os'] == 'freebsd64') os = 'X11; U; FreeBSD amd64';
		else if (localStorage['useragentspoof_os'] == 'freebsd32') os = 'X11; U; FreeBSD i686';
		else if (localStorage['useragentspoof_os'] == 'netbsd64') os = 'X11; U; NetBSD amd64';
		else if (localStorage['useragentspoof_os'] == 'netbsd32') os = 'X11; U; NetBSD i686';
		else if (localStorage['useragentspoof_os'] == 'openbsd64') os = 'X11; U; OpenBSD i686';
		else if (localStorage['useragentspoof_os'] == 'openbsd32') os = 'X11; U; OpenBSD i686';
		else if (localStorage['useragentspoof_os'] == 'chromeos') os = 'X11; U; CrOS i686 0.13.507';
		if (localStorage['useragentspoof'] == 'chrome63')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';
		else if (localStorage['useragentspoof'] == 'chrome62')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36';
		else if (localStorage['useragentspoof'] == 'chrome55')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';
		else if (localStorage['useragentspoof'] == 'chrome50')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36 OPR/37.0.2178.43';
		else if (localStorage['useragentspoof'] == 'chrome14')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.94 Safari/535.1';
		else if (localStorage['useragentspoof'] == 'chrome13')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.43 Safari/535.1';
		else if (localStorage['useragentspoof'] == 'chrome12')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.750.0 Safari/534.30';
		else if (localStorage['useragentspoof'] == 'opera49')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.39';
		else if (localStorage['useragentspoof'] == 'opera42')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36 OPR/42.0.2393.85';
		else if (localStorage['useragentspoof'] == 'opera37')
			userAgent = 'Mozilla/5.0 ('+os+') Presto/2.9.181 Version/12.00';
		else if (localStorage['useragentspoof'] == 'opera12')
			userAgent = 'Opera/9.80 ('+os+') Presto/2.9.181 Version/12.00';
		else if (localStorage['useragentspoof'] == 'opera11')
			userAgent = 'Opera/9.80 ('+os+') Presto/2.9.168 Version/11.50';
		else if (localStorage['useragentspoof'] == 'firefox57')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:57.0) Gecko/20100101 Firefox/57.0';
		else if (localStorage['useragentspoof'] == 'firefox50')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:50.0) Gecko/20100101 Firefox/50.0';
		else if (localStorage['useragentspoof'] == 'firefox48')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:48.0) Gecko/20100101 Firefox/48.0';
		else if (localStorage['useragentspoof'] == 'firefox46')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:44.0) Gecko/20100101 Firefox/44.0';
		else if (localStorage['useragentspoof'] == 'firefox6')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:6.0a2) Gecko/20110613 Firefox/6.0a2';
		else if (localStorage['useragentspoof'] == 'firefox5')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:5.0) Gecko/20100101 Firefox/5.0';
		else if (localStorage['useragentspoof'] == 'firefox4')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:2.0.1) Gecko/20110606 Firefox/4.0.1';
		else if (localStorage['useragentspoof'] == 'firefox3')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:1.9.2.9) Gecko/20100913 Firefox/3.6.9';
		else if (localStorage['useragentspoof'] == 'edge')
 			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) 42.0.2311.135 Safari/537.36 Edge/12.246';
		else if (localStorage['useragentspoof'] == 'ie11')
			userAgent = 'Mozilla/5.0 ('+os+'; Trident/7.0; rv:11.0) like Gecko';
		else if (localStorage['useragentspoof'] == 'ie10')
			userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; '+os+'; Trident/6.0)';
		else if (localStorage['useragentspoof'] == 'ie9')
			userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; '+os+')';
		else if (localStorage['useragentspoof'] == 'ie8')
			userAgent = 'Mozilla/4.0 (compatible; MSIE 8.0; '+os+')';
		else if (localStorage['useragentspoof'] == 'ie7')
			userAgent = 'Mozilla/4.0(compatible; MSIE 7.0; '+os+')';
		else if (localStorage['useragentspoof'] == 'ie61')
			userAgent = 'Mozilla/4.0 (compatible; MSIE 6.1; '+os+')';
		else if (localStorage['useragentspoof'] == 'ie60')
			userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; '+os+')';
		else if (localStorage['useragentspoof'] == 'safari8')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12';
		else if (localStorage['useragentspoof'] == 'safari7')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A';
		else if (localStorage['useragentspoof'] == 'safari5')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';
		else if (localStorage['useragentspoof'] == 'palemoon256')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:25.6) Gecko/20150723 PaleMoon/25.6.0';
		else if (localStorage['useragentspoof'] == 'palemoon25')
			userAgent = 'Mozilla/5.0 ('+os+'; rv:25.1) Gecko/20130308 PaleMoon/25.1';
		else if (localStorage['useragentspoof'] == 'vivaldi111')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.91 Safari/537.36 Vivaldi/1.92.917.35';
		else if (localStorage['useragentspoof'] == 'vivaldi')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.89 Safari/537.36 Vivaldi/1.0.83.38';
		else if (localStorage['useragentspoof'] == 'midori')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/538.15 (KHTML, like Gecko) Chrome/18.0.1025.133 Safari/538.15 Midori/0.5';
		else if (localStorage['useragentspoof'] == 'qupzilla')
			userAgent = 'Mozilla/5.0 ('+os+') AppleWebKit/533.3 (KHTML, like Gecko) Qupzilla/1.1.5';
	}
}
function removeParams(str) {
	return str.replace(/#[^#]*$/, "").replace(/\?[^\?]*$/, "");
}
function UrlInList(url, elems) { // thanks vnagarnaik!
	var foundElem = false;
	for (var i = elems.length - 1; i >= 0; i--) {
		if (elems[i].indexOf(url) > -1) {
			foundElem = true;
			break;
		}
	}
	return foundElem;
}
function inlineblock(req) {
	if (req.tabId == -1 || req.url === 'undefined' || localStorage["enable"] == "false") {
		return;
	}
    var headers = req.responseHeaders;
	if (req.type == 'main_frame') {
		var domainCheckStatus = domainCheck(req.url, 1);
		if (experimental == '1' && localStorage['preservesamedomain'] == 'false' && localStorage['script'] == 'true' && enabled(req.url) == 'true') {
			headers.push({
				'name': 'Content-Security-Policy',
				'value': "script-src 'none'"
			});
			recentlog['blocked'].push([new Date().getTime(), req.url, 'PAGE', extractDomainFromURL(req.url), req.url, domainCheckStatus, domainCheckStatus, baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial'], 2), false]);
			updateRecents('blocked');
		} else {
			recentlog['allowed'].push([new Date().getTime(), req.url, 'PAGE', extractDomainFromURL(req.url), req.url, domainCheckStatus, 0]);
			updateRecents('allowed');
		}
	}
    return { responseHeaders: headers };
}
function ScriptSafe(req) {
	if (req.tabId == -1 || req.url === 'undefined' || localStorage["enable"] == "false" || req.url.substring(0,4) != 'http') {
		resetTabData(req.tabId, req.url);
		return { cancel: false };
	}
	if (req.type == 'main_frame') {
		resetTabData(req.tabId, req.url);
	}
	if (typeof ITEMS[req.tabId] === 'undefined') return { cancel: false };
	var reqtype = req.type;
	if (reqtype == "sub_frame") reqtype = 'frame';
	else if (reqtype == "main_frame") reqtype = 'page';
	var thirdPartyCheck;
	var elementStatusCheck;
	var baddiesCheck = baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial'], 2);
	var extractedDomain = extractDomainFromURL(ITEMS[req.tabId]['url']);
	var extractedReqDomain = extractDomainFromURL(req.url);
	var domainCheckStatus = domainCheck(req.url, 1);
	var tabDomainCheckStatus = domainCheck(extractedDomain, 1);
	if (tabDomainCheckStatus == '1' || (tabDomainCheckStatus == '-1' && localStorage['mode'] == 'block' && localStorage['paranoia'] == 'true' && localStorage['preservesamedomain'] == 'false')) {
		elementStatusCheck = true;
		thirdPartyCheck = true;
	} else {
		if ((domainCheckStatus == '0' && !(tabDomainCheckStatus == '-1' && localStorage['mode'] == 'block' && localStorage['paranoia'] == 'true')) || (localStorage['preservesamedomain'] == 'strict' && extractedDomain == extractedReqDomain)) thirdPartyCheck = false;
		else if (localStorage['preservesamedomain'] == 'strict' && extractedDomain != extractedReqDomain) thirdPartyCheck = true;
		else thirdPartyCheck = thirdParty(req.url, extractedDomain);
		if ((tabDomainCheckStatus == '-1' && localStorage['mode'] == 'block' && localStorage['paranoia'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && localStorage['mode'] == 'block'))) || ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (localStorage['antisocial'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	var utmCleanURL = utmClean(req.url);
	var hashCleanURL = hashTrackingClean(req.url);
	if (elementStatusCheck && baddiesCheck && reqtype == "image") reqtype = 'webbug';
	if ((reqtype == "page" && localStorage['mode'] == 'block' && (domainCheckStatus == '1' || ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (localStorage['antisocial'] == 'true' && baddiesCheck == '2'))) || (reqtype == "frame" && (localStorage['iframe'] == 'true' || localStorage['frame'] == 'true')) || (reqtype == "script" && localStorage['script'] == 'true') || (reqtype == "object" && (localStorage['object'] == 'true' || localStorage['embed'] == 'true')) || (reqtype == "image" && localStorage['image'] == 'true') || reqtype == "webbug" || (reqtype == "xmlhttprequest" && ((localStorage['xml'] == 'true' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || localStorage['xml'] == 'all'))) {
		// request qualified for filtering, so continue.
	} else {
		if (utmCleanURL) return { redirectUrl: utmCleanURL };
		if (hashCleanURL) return { redirectUrl: hashCleanURL };
		return { cancel: false };
	}
	var cleanedUrl = removeParams(req.url);
	if (elementStatusCheck && ((localStorage['preservesamedomain'] != 'false' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || localStorage['preservesamedomain'] == 'false')) {
		if (typeof ITEMS[req.tabId]['blocked'] === 'undefined') ITEMS[req.tabId]['blocked'] = [];
		if (!UrlInList(cleanedUrl, ITEMS[req.tabId]['blocked'])) {
			if (extractedReqDomain.substr(0,4) == 'www.') extractedReqDomain = extractedReqDomain.substr(4);
			ITEMS[req.tabId]['blocked'].push([cleanedUrl, reqtype.toUpperCase(), extractedReqDomain, domainCheckStatus, tabDomainCheckStatus, baddiesCheck, false]);
			recentlog['blocked'].push([new Date().getTime(), req.url, reqtype.toUpperCase(), extractedReqDomain, ITEMS[req.tabId]['url'], domainCheckStatus, tabDomainCheckStatus, baddiesCheck, false]);
			updateRecents('blocked');
			updateCount(req.tabId);
		}
		if (reqtype == 'frame') {
			return { redirectUrl: 'about:blank' };
		} else if (reqtype == 'webbug' || reqtype == 'image') {
			return { redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' };
		}
		return { cancel: true };
	} else {
		if (typeof ITEMS[req.tabId]['allowed'] === 'undefined') ITEMS[req.tabId]['allowed'] = [];
		if (!UrlInList(cleanedUrl, ITEMS[req.tabId]['allowed'])) {
			if (extractedReqDomain.substr(0,4) == 'www.') extractedReqDomain = extractedReqDomain.substr(4);
			ITEMS[req.tabId]['allowed'].push([cleanedUrl, reqtype.toUpperCase(), extractedReqDomain, domainCheckStatus, baddiesCheck]);
			recentlog['allowed'].push([new Date().getTime(), req.url, reqtype.toUpperCase(), extractedReqDomain, ITEMS[req.tabId]['url'], domainCheckStatus, baddiesCheck]);
			updateRecents('allowed');
		}
	}
	if (utmCleanURL) return { redirectUrl: utmCleanURL };
	if (hashCleanURL) return { redirectUrl: hashCleanURL };
	return { cancel: false };
}
function updateRecents(list) {
	window.clearTimeout(recentstimer);
	recentstimer = window.setTimeout(function() { setRecents(list) }, 1000);
}
function setRecents(list) {
	var recentLimit = 25;
	var recentsLength = recentlog[list].length;
	if (recentsLength > recentLimit) recentlog[list] = recentlog[list].slice(recentsLength-recentLimit);
}
function getRecents(list) {
	setRecents(list);
	return JSON.stringify(recentlog[list]);
}
function clearRecents() {
	recentlog['allowed'] = [];
	recentlog['blocked'] = [];
}
function utmClean(url) {
	if (localStorage['utm'] == "true") {
		var paramstart = url.indexOf("?");
		var sanitized = url;
		if (paramstart != -1) {
			if (url.indexOf("utm_") > paramstart) {
				sanitized = sanitized.replace(/[\?\&]utm_(?:cid|reader|term|content|source|medium|campaign|name)=[^&#]+/ig, "");
				if (sanitized.charAt(paramstart) == "&") sanitized = sanitized.substring(0, paramstart)+"?"+sanitized.substring(paramstart+1);
			}
		}
		sanitized = sanitized.replace(/#utm_(?:cid|reader|term|content|source|medium|campaign)=.+/i, "");
		if (url != sanitized) return sanitized;
	}
	return false;
}
function hashTrackingClean(url) {
	if (localStorage['hashchecking'] == "true" && (localStorage['hashallow'] == "true" || enabled(url) == 'true')) {
		var hashstart = url.indexOf("#");
		if (hashstart != -1) {
			if (url.indexOf("=") > hashstart) {
				return url.substring(0, hashstart);
			}
		}
	}
	return false;
}
function enabled(url) {
	var domainCheckStatus = domainCheck(url);
	if (localStorage["enable"] == "true" && domainCheckStatus != '0' && (domainCheckStatus == '1' || (localStorage["mode"] == "block" && domainCheckStatus == '-1')) && url.indexOf('https://chrome.google.com/webstore') == -1 && (url.substring(0,4) == 'http' || url == 'chrome://newtab/'))
		return 'true';
	return 'false';
}
function enabledfp(domainname, fptype) {
	if ((localStorage['canvas'] == 'false' && fptype == 'fpCanvas') || (localStorage['canvasfont'] == 'false' && fptype == 'fpCanvasFont') || (localStorage['audioblock'] == 'false' && fptype == 'fpAudio') || (localStorage['webgl'] == 'false' && fptype == 'fpWebGL') || (localStorage['battery'] == 'false' && fptype == 'fpBattery') || (localStorage['webrtcdevice'] == 'false' && fptype == 'fpDevice') || (localStorage['gamepad'] == 'false' && fptype == 'fpGamepad') || (localStorage['webvr'] == 'false' && fptype == 'fpWebVR') || (localStorage['bluetooth'] == 'false' && fptype == 'fpBluetooth') || (localStorage['clientrects'] == 'false' && fptype == 'fpClientRectangles') || (localStorage['clipboard'] == 'false' && fptype == 'fpClipboard') || (localStorage['browserplugins'] == 'false' && fptype == 'fpBrowserPlugins')) return '-1';
	if (in_array(domainname, fpLists[fptype])) return '1';
	if (in_array(domainname, fpListsSession[fptype])) return '2';
	return '-1';
}
function domainCheck(domain, req) {
	if (req === undefined) {
		var baddiesCheck = baddies(domain, localStorage['annoyancesmode'], localStorage['antisocial']);
		if (((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddiesCheck == '1') || (localStorage['antisocial'] == 'true' && baddiesCheck == '2') || (localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'relaxed' && baddiesCheck))) return '1';
	}
	var domainname = extractDomainFromURL(domain);
	if (req != '2') {
		if (localStorage['mode'] == 'block' && in_array(domainname, sessionWhiteList)) return '0';
		if (localStorage['mode'] == 'allow' && in_array(domainname, sessionBlackList)) return '1';
	}
	if (in_array(domainname, whiteList)) return '0';
	if (in_array(domainname, blackList)) return '1';
	if (req === undefined) {
		if (localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'relaxed' && baddiesCheck) return '1';
	}
	return '-1';
}
function domainSort(hosts) {
	var sorted_hosts = new Array();
	var split_hosts = new Array();
	if (hosts.length > 0) {
		if (typeof hosts[0] === 'object') {
			for (var h in hosts) {
				split_hosts.push([getDomain(hosts[h][2]), hosts[h][0], hosts[h][1], hosts[h][2], hosts[h][3], hosts[h][4], hosts[h][5], hosts[h][6]]);
			}
			split_hosts.sort();
			for (var h in split_hosts) {
				sorted_hosts.push([split_hosts[h][1], split_hosts[h][2], split_hosts[h][3], split_hosts[h][4], split_hosts[h][5], split_hosts[h][6], split_hosts[h][7]]);
			}
		} else {
			for (var h in hosts) {
				split_hosts.push([getDomain(hosts[h]), hosts[h]]);
			}
			split_hosts.sort();
			for (var h in split_hosts) {
				sorted_hosts.push(split_hosts[h][1]);
			}
		}
		return sorted_hosts;
	}
	return hosts;
}
function trustCheck(domain) {
	if (in_array(domain, trustList)) return '1';
	if (in_array(domain, distrustList)) return '2';
	return false;
}
function topHandler(domain, mode) {
	if (domain) {
		if (!domain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && !domain.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) domain = '**.'+getDomain(domain);
		if (mode != '0' && mode != '1') fpDomainHandler(domain, mode, 1);
		else domainHandler(domain, mode);
		changed = true;
		return true;
	}
	return false;
}
function haystackSearch(needle, haystack) {
	var keys = [];
	var rootdomain = getDomain(needle);
	for (var key in haystack) {
		if (rootdomain == getDomain(haystack[key])) {
			keys.push(haystack[key]);
		}
	}
	return keys;
}
function domainHandler(domain,action,listtype) {
	if (listtype === undefined)
		listtype = 0;
	if (domain) {
		action = parseInt(action);
		// Initialize local storage
		if (listtype == 0) {
			if (typeof(localStorage['whiteList'])==='undefined') localStorage['whiteList'] = JSON.stringify([]);
			if (typeof(localStorage['blackList'])==='undefined') localStorage['blackList'] = JSON.stringify([]);
			var tempWhitelist = JSON.parse(localStorage['whiteList']);
			var tempBlacklist = JSON.parse(localStorage['blackList']);
		} else if (listtype == 1) {
			if (typeof(sessionStorage['whiteList'])==='undefined') sessionStorage['whiteList'] = JSON.stringify([]);
			if (typeof(sessionStorage['blackList'])==='undefined') sessionStorage['blackList'] = JSON.stringify([]);
			var tempWhitelist = JSON.parse(sessionStorage['whiteList']);
			var tempBlacklist = JSON.parse(sessionStorage['blackList']);
		}
		// Remove domain from whitelist and blacklist
		var pos = tempWhitelist.indexOf(domain);
		if (pos != -1) tempWhitelist.splice(pos,1);
		pos = tempBlacklist.indexOf(domain);
		if (pos != -1) tempBlacklist.splice(pos,1);
		if (domain.substr(0,4)=='www.') {
			domain = domain.substr(4);
			pos = tempWhitelist.indexOf(domain);
			if (pos != -1) tempWhitelist.splice(pos,1);
			pos = tempBlacklist.indexOf(domain);
			if (pos != -1) tempBlacklist.splice(pos,1);
		}
		if (listtype == 0 && action != 2) {
			var tempDomain;
			if (domain.substr(0,3)=='**.') {
				tempDomain = domain.substr(3);
				var whiteInstances = haystackSearch(tempDomain, tempWhitelist);
				var blackInstances = haystackSearch(tempDomain, tempBlacklist);
				var whiteInstancesCount = whiteInstances.length;
				var blackInstancesCount = blackInstances.length;
				if (whiteInstancesCount || blackInstancesCount) {
					var lingo = '';
					if (action == 1) lingo = 'dis';
					if (confirm('ScriptSafe detected '+(whiteInstancesCount+blackInstancesCount)+' existing rule(s) for '+tempDomain+' ('+whiteInstancesCount+' whitelist and '+blackInstancesCount+' blacklist).\r\nDo you want to delete them before '+lingo+'trusting the entire '+tempDomain+' domain in order to avoid conflicts?\r\nNote: this might not necessarily remove all conflicting entries, particularly if they use regex (e.g. d?main.com).')) {
						if (whiteInstancesCount) {
							for (var x=0; x<whiteInstancesCount; x++) {
								tempWhitelist.splice(tempWhitelist.indexOf(whiteInstances[x]),1);
							}
						}
						if (blackInstancesCount) {
							for (var x=0; x<blackInstancesCount; x++) {
								tempBlacklist.splice(tempBlacklist.indexOf(blackInstances[x]),1);
							}
						}
					} else {
						if (!confirm('Do you still want to proceed '+lingo+'trusting the entire '+tempDomain+' domain?')) {
							return false;
						}
					}
				}
			} else {
				tempDomain = '**.'+getDomain(domain);
			}
			var pos = tempWhitelist.indexOf(tempDomain);
			if (pos != -1) tempWhitelist.splice(pos,1);
			pos = tempBlacklist.indexOf(tempDomain);
			if (pos != -1) tempBlacklist.splice(pos,1);
		}
		switch(action) {
			case 0:	// Whitelist
				tempWhitelist.push(domain);
				break;
			case 1:	// Blacklist
				tempBlacklist.push(domain);
				break;
			case 2:	// Remove
				break;
		}
		if (listtype == 0) {
			localStorage['whiteList'] = JSON.stringify(tempWhitelist);
			localStorage['blackList'] = JSON.stringify(tempBlacklist);
			cacheLists();
		} else if (listtype == 1) {
			sessionStorage['whiteList'] = JSON.stringify(tempWhitelist);
			sessionStorage['blackList'] = JSON.stringify(tempBlacklist);
			tempWhitelist = tempWhitelist.sort();
			sessionWhiteList = tempWhitelist;
			tempBlacklist = tempBlacklist.sort();
			sessionBlackList = tempBlacklist;
		}
		clearRecents();
		return true;
	}
	return false;
}
function fpDomainHandler(domain,listtype,action,temp) {
	if (temp === undefined)
		temp = 0;
	if (domain) {
		action = parseInt(action);
		// Initialize local storage
		if (temp == 0) {
			if (typeof(localStorage[listtype])==='undefined') localStorage[listtype] = JSON.stringify([]);
			var tempList = JSON.parse(localStorage[listtype]);
		} else if (temp == 1) {
			if (typeof(localStorage[listtype])==='undefined') sessionStorage[listtype] = JSON.stringify([]);
			var tempList = JSON.parse(sessionStorage[listtype]);
		}
		// Remove domain from list
		var pos = tempList.indexOf(domain);
		if (pos != -1) tempList.splice(pos,1);
		if (domain.substr(0,4)=='www.') {
			domain = domain.substr(4);
			pos = tempList.indexOf(domain);
			if (pos != -1) tempList.splice(pos,1);
		}
		if (action != -1) {
			var tempDomain;
			if (domain.substr(0,3)=='**.') {
				tempDomain = domain.substr(3);
				var instances = haystackSearch(tempDomain, tempList);
				var instancesCount = instances.length;
				if (instancesCount) {
					if (confirm('ScriptSafe detected '+instancesCount+' existing rule(s) for '+tempDomain+'.\r\nDo you want to delete them before trusting the entire '+tempDomain+' domain in order to avoid conflicts?\r\nNote: this might not necessarily remove all conflicting entries, particularly if they use regex (e.g. d?main.com).')) {
						if (instancesCount) {
							for (var x=0; x<instancesCount; x++) {
								tempList.splice(tempList.indexOf(instances[x]),1);
							}
						}
					} else {
						if (!confirm('Do you still want to proceed trusting the entire '+tempDomain+' domain?')) {
							return false;
						}
					}
				}
			} else {
				tempDomain = '**.'+getDomain(domain);
			}
			var pos = tempList.indexOf(tempDomain);
			if (pos != -1) tempList.splice(pos,1);
		}
		switch(action) {
			case 1:	// Add
				tempList.push(domain);
				break;
			case -1: // Remove
				break;
		}
		if (temp == 0) {
			localStorage[listtype] = JSON.stringify(tempList);
			tempList = tempList.sort();
			fpLists[listtype] = tempList;
		} else if (temp == 1) {
			sessionStorage[listtype] = JSON.stringify(tempList);
			tempList = tempList.sort();
			fpListsSession[listtype] = tempList;
		}
		clearRecents();
		return true;
	}
	return false;
}
function optionExists(opt) {
	return (typeof localStorage[opt] !== "undefined");
}
function defaultOptionValue(opt, val) {
	if (!optionExists(opt)) localStorage[opt] = val;
}
function setDefaultOptions(force) {
	var settingNames = {
		"version": version,
		"sync": "false",
		"syncenable": "false",
		"syncnotify": "true",
		"syncfromnotify": "true",
		"lastSync": "0",
		"updatenotify": "true",
		"enable": "true",
		"mode": "block",
		"refresh": "true",
		"script": "true",
		"noscript": "false",
		"object": "true",
		"applet": "true",
		"embed": "true",
		"iframe": "true",
		"frame": "true",
		"audio": "true",
		"video": "true",
		"image": "false",
		"showcontext": "true",
		"canvas": "false",
		"canvasfont": "false",
		"clientrects": "false",
		"audioblock": "false",
		"webgl": "false",
		"battery": "false",
		"webrtcdevice": "false",
		"gamepad": "false",
		"webvr": "false",
		"bluetooth": "false",
		"timezone": "false",
		"keyboard": "false",
		"keydelta": "40",
		"xml": "true",
		"annoyances": "true",
		"annoyancesmode": "relaxed",
		"antisocial": "false",
		"preservesamedomain": "false",
		"webbugs": "true",
		"utm": "false",
		"hashchecking": "false",
		"hashallow": "false",
		"webrtc": "default_public_interface_only",
		"classicoptions": "false",
		"rating": "true",
		"referrer": "true",
		"linktarget": "off",
		"domainsort": "true",
		"useragentspoof": "off",
		"useragentspoof_os": "off",
		"useragentinterval": "off",
		"useragentintervalmins": "5",
		"uaspoofallow": "false",
		"referrerspoof": "off",
		"referrerspoofdenywhitelisted": "false",
		"cookies": "true",
		"paranoia": "false",
		"dataurl": "false",
		"clipboard": "false",
		"optionslist": "false",
		"browserplugins": "false"
	}
	if (force) {
		for (var i in settingNames) {
			localStorage[i] = settingNames[i];
		}
		updated = true;
	} else {
		for (var i in settingNames) {
			defaultOptionValue(i, settingNames[i]);
		}
	}
	if (optionExists("updatemessagenotify")) delete localStorage['updatemessagenotify'];
	if (optionExists("useragentcustom")) {
		localStorage['useragent'] = JSON.stringify([localStorage['useragentcustom']]);
		delete localStorage['useragentcustom'];
	}
	if ((force && force == '2') || !optionExists("blackList")) localStorage['blackList'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("whiteList")) localStorage['whiteList'] = JSON.stringify(["*.googlevideo.com"]);
	if ((force && force == '2') || !optionExists("fpCanvas")) localStorage['fpCanvas'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpCanvasFont")) localStorage['fpCanvasFont'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpAudio")) localStorage['fpAudio'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpWebGL")) localStorage['fpWebGL'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpBattery")) localStorage['fpBattery'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpDevice")) localStorage['fpDevice'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpGamepad")) localStorage['fpGamepad'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpWebVR")) localStorage['fpWebVR'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpBluetooth")) localStorage['fpBluetooth'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpClientRectangles")) localStorage['fpClientRectangles'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpClipboard")) localStorage['fpClipboard'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("fpBrowserPlugins")) localStorage['fpBrowserPlugins'] = JSON.stringify([]);
	if ((force && force == '2') || !optionExists("useragent")) localStorage['useragent'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['blackList'] === "undefined") sessionStorage['blackList'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['whiteList'] === "undefined") sessionStorage['whiteList'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpCanvas'] === "undefined") sessionStorage['fpCanvas'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpCanvasFont'] === "undefined") sessionStorage['fpCanvasFont'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpAudio'] === "undefined") sessionStorage['fpAudio'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpWebGL'] === "undefined") sessionStorage['fpWebGL'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpBattery'] === "undefined") sessionStorage['fpBattery'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpDevice'] === "undefined") sessionStorage['fpDevice'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpGamepad'] === "undefined") sessionStorage['fpGamepad'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpWebVR'] === "undefined") sessionStorage['fpWebVR'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpBluetooth'] === "undefined") sessionStorage['fpBluetooth'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpClientRectangles'] === "undefined") sessionStorage['fpClientRectangles'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpClipboard'] === "undefined") sessionStorage['fpClipboard'] = JSON.stringify([]);
	if ((force && force == '2') || typeof sessionStorage['fpBrowserPlugins'] === "undefined") sessionStorage['fpBrowserPlugins'] = JSON.stringify([]);
	chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
}
function updateCount(tabId) {
	var TAB_ITEMS = ITEMS[tabId] || (ITEMS[tabId] = [0]);
	var TAB_BLOCKED_COUNT = ++TAB_ITEMS[0];
	chrome.browserAction.setBadgeBackgroundColor({ color: [208, 0, 24, 255], tabId: tabId });
	chrome.browserAction.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
}
function initCount(tabId) {
	var TAB_ITEMS = ITEMS[tabId] || (ITEMS[tabId] = [0]);
	var TAB_BLOCKED_COUNT = TAB_ITEMS[0];
	chrome.browserAction.setBadgeBackgroundColor({ color: [208, 0, 24, 255], tabId: tabId });
	if (TAB_BLOCKED_COUNT != 0) chrome.browserAction.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
}
function removeHash(str) {
	var hashindex = str.indexOf("#");
	if (hashindex != -1) return str.substr(0, hashindex);
	return str;
}
function resetTabData(id, url) {
	if (id && url) {
		ITEMS[id] = [0];
		ITEMS[id]['url'] = url;
		ITEMS[id]['blocked'] = [];
		ITEMS[id]['allowed'] = [];
	}
}
function revokeTemp() {
	sessionBlackList = '';
	sessionWhiteList = '';
	fpListsSession = [];
	sessionStorage['blackList'] = JSON.stringify([]);
	sessionStorage['whiteList'] = JSON.stringify([]);
	sessionStorage['fpCanvas'] = JSON.stringify([]);
	sessionStorage['fpCanvasFont'] = JSON.stringify([]);
	sessionStorage['fpAudio'] = JSON.stringify([]);
	sessionStorage['fpWebGL'] = JSON.stringify([]);
	sessionStorage['fpBattery'] = JSON.stringify([]);
	sessionStorage['fpDevice'] = JSON.stringify([]);
	sessionStorage['fpGamepad'] = JSON.stringify([]);
	sessionStorage['fpWebVR'] = JSON.stringify([]);
	sessionStorage['fpBluetooth'] = JSON.stringify([]);
	sessionStorage['fpClientRectangles'] = JSON.stringify([]);
	sessionStorage['fpClipboard'] = JSON.stringify([]);
	sessionStorage['fpBrowserPlugins'] = JSON.stringify([]);
}
function statuschanger(duration) {
	window.clearTimeout(reenabletimer);
	if (localStorage['enable'] == 'true') {
		localStorage['enable'] = 'false';
		chrome.browserAction.setIcon({path: "../img/IconDisabled.png"});
		if (duration) {
			duration = duration * 60 * 1000;
			reenabletimer = setTimeout(function() { localStorage['enable'] = 'true'; }, duration);
		}
	} else {
		localStorage['enable'] = 'true';
		chrome.browserAction.setIcon({path: "../img/IconForbidden.png"});
	}
	reinitContext();
}
function tempHandler(request) {
	if (typeof request.url === 'object') {
		for (var i=0, forcount=request.url.length;i<forcount;i++) {
			if (request.url[i][0] != 'no.script' && request.url[i][0] != 'web.bug') {
				var baddiesStatus = baddies(request.url[i], localStorage['annoyancesmode'], localStorage['antisocial']);
				if ((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddiesStatus == 1) || (localStorage['antisocial'] == 'true' && baddiesStatus == '2')) {
					// do nothing
				} else {
					if (request.mode == 'block') domainHandler(request.url[i], 0, 1);
					else domainHandler(request.url[i], 1, 1);
				}
			}
		}
	} else {
		var baddiesStatus = baddies(request.url, localStorage['annoyancesmode'], localStorage['antisocial']);
		if ((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddiesStatus == 1) || (localStorage['antisocial'] == 'true' && baddiesStatus == '2')) {
			// do nothing
		} else {
			if (request.mode == 'block') domainHandler(request.url, 0, 1);
			else domainHandler(request.url, 1, 1);
		}
	}
	changed = true;
}
function removeTempHandler(request) {
	if (typeof request.url === 'object') {
		for (var i=0, forcount=request.url.length;i<forcount;i++) {
			domainHandler(request.url[i], 2, 1);
		}
	} else {
		domainHandler(request.url, 2, 1);
	}
	changed = true;
}
function getSessionList() {
	if (localStorage['mode'] == 'block') return sessionWhiteList;
	else if (localStorage['mode'] == 'allow') return sessionBlackList;
}
function checkTemp(domain) {
	return in_array(domain, getSessionList());
}
chrome.tabs.onRemoved.addListener(function(tabid) {
	if (typeof ITEMS[tabid] !== 'undefined') delete ITEMS[tabid];
});
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
	if (localStorage['enable'] == 'true') {
		if (changeinfo.status == 'loading') {
			var icontype = "Allowed";
			if (enabled(tab.url) == "true")
				icontype = "Forbidden";
			var extractedDomain = extractDomainFromURL(tab.url);
			if (in_array(extractedDomain, sessionWhiteList) || in_array(extractedDomain, sessionBlackList))
				icontype = "Temp";
			chrome.browserAction.setIcon({path: "../img/Icon"+icontype+".png", tabId: tabid});
		} else if (changeinfo.status == "complete") {
			if (typeof ITEMS[tabid] !== 'undefined') {
				changed = true;
				if (localStorage['mode'] == 'block' && typeof ITEMS[tabid]['allowed'] !== 'undefined') {
					for (var i=0, forcount=ITEMS[tabid]['allowed'].length; i<forcount; i++) {
						if (in_array(extractDomainFromURL(ITEMS[tabid]['allowed'][i][0]), sessionWhiteList)) {
							chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: tabid});
							break;
						}
					}
				} else if (localStorage['mode'] == 'allow' && typeof ITEMS[tabid]['blocked'] !== 'undefined') {
					for (var i=0, forcount=ITEMS[tabid]['blocked'].length; i<forcount; i++) {
						if (in_array(extractDomainFromURL(ITEMS[tabid]['blocked'][i][0]), sessionBlackList)) {
							chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: tabid});
							break;
						}
					}
				}
			}
		}
	} else chrome.browserAction.setIcon({path: "../img/IconDisabled.png", tabId: tabid});
});
chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (port.name == 'popuplifeline') {
			if (msg.url && msg.tid) {
				popup=[msg.url, msg.tid];
			}
		}
	});
	port.onDisconnect.addListener(function() {
		if (popup.length > 0) {
			if (localStorage['refresh'] == 'true') chrome.tabs.update(popup[1], {url: popup[0]});
			popup=[];
		}
	});
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.reqtype == 'get-settings') {
		var fpListStatus = [];
		var extractedDomain = extractDomainFromURL(sender.tab.url);
		for (var i in fpTypes) {
			fpListStatus[fpTypes[i]] = enabledfp(extractedDomain, fpTypes[i]);
		}
		sendResponse({status: localStorage['enable'], enable: enabled(sender.tab.url), fp_canvas: fpListStatus['fpCanvas'], fp_canvasfont: fpListStatus['fpCanvasFont'], fp_audio: fpListStatus['fpAudio'], fp_webgl: fpListStatus['fpWebGL'], fp_battery: fpListStatus['fpBattery'], fp_device: fpListStatus['fpDevice'], fp_gamepad: fpListStatus['fpGamepad'], fp_webvr: fpListStatus['fpWebVR'], fp_bluetooth: fpListStatus['fpBluetooth'], fp_clientrectangles: fpListStatus['fpClientRectangles'], fp_clipboard: fpListStatus['fpClipboard'], fp_browserplugins: fpListStatus['fpBrowserPlugins'], experimental: experimental, mode: localStorage['mode'], annoyancesmode: localStorage['annoyancesmode'], antisocial: localStorage['antisocial'], whitelist: whiteList, blacklist: blackList, whitelistSession: sessionWhiteList, blackListSession: sessionBlackList, script: localStorage['script'], noscript: localStorage['noscript'], object: localStorage['object'], applet: localStorage['applet'], embed: localStorage['embed'], iframe: localStorage['iframe'], frame: localStorage['frame'], audio: localStorage['audio'], video: localStorage['video'], image: localStorage['image'], annoyances: localStorage['annoyances'], preservesamedomain: localStorage['preservesamedomain'], canvas: localStorage['canvas'], canvasfont: localStorage['canvasfont'], audioblock: localStorage['audioblock'], webgl: localStorage['webgl'], battery: localStorage['battery'], webrtcdevice: localStorage['webrtcdevice'], gamepad: localStorage['gamepad'], webvr: localStorage['webvr'], bluetooth: localStorage['bluetooth'], clientrects: localStorage['clientrects'], timezone: localStorage['timezone'], browserplugins: localStorage['browserplugins'], keyboard: localStorage['keyboard'], keydelta: localStorage['keydelta'], webbugs: localStorage['webbugs'], referrer: localStorage['referrer'], referrerspoofdenywhitelisted: localStorage['referrerspoofdenywhitelisted'], linktarget: localStorage['linktarget'], paranoia: localStorage['paranoia'], clipboard: localStorage['clipboard'], dataurl: localStorage['dataurl'], useragent: userAgent, uaspoofallow: localStorage['uaspoofallow']});
		if (typeof ITEMS[sender.tab.id] === 'undefined') {
			resetTabData(sender.tab.id, sender.tab.url);
		} else {
			if ((request.iframe != '1' && ((ITEMS[sender.tab.id]['url'] != sender.tab.url && (sender.tab.url.indexOf("#") != -1 || ITEMS[sender.tab.id]['url'].indexOf("#") != -1) && removeHash(sender.tab.url) != removeHash(ITEMS[sender.tab.id]['url'])) || (sender.tab.url.indexOf("#") == -1 && ITEMS[sender.tab.id]['url'].indexOf("#") == -1 && sender.tab.url != ITEMS[sender.tab.id]['url']) || changed) || sender.tab.url.indexOf('https://chrome.google.com/webstore') != -1)) {
				if (changed && ITEMS[sender.tab.id]['url'] == sender.tab.url) {
					initCount(sender.tab.id);
				} else {
					resetTabData(sender.tab.id, sender.tab.url);
				}
			}
		}
		var fptype;
		var cleanedUrl = removeParams(sender.tab.url);
		for (var i in fpListStatus) {
			if (fpListStatus[i] != '-1') {
				if (i == 'fpCanvas') fptype = 'Canvas Fingerprint';
				else if (i == 'fpCanvasFont') fptype = 'Canvas Font Access';
				else if (i == 'fpAudio') fptype = 'Audio Fingerprint';
				else if (i == 'fpWebGL') fptype = 'WebGL Fingerprint';
				else if (i == 'fpBattery') fptype = 'Battery Fingerprint';
				else if (i == 'fpDevice') fptype = 'Device Enumeration';
				else if (i == 'fpGamepad') fptype = 'Gamepad Enumeration';
				else if (i == 'fpWebVR') fptype = 'WebVR Enumeration';
				else if (i == 'fpBluetooth') fptype = 'Bluetooth Enumeration';
				else if (i == 'fpClientRectangles') fptype = 'Client Rectangles';
				else if (i == 'fpClipboard') fptype = 'Clipboard Interference';
				else if (i == 'fpBrowserPlugins') fptype = 'Browser Plugins Enumeration';
				if (extractedDomain.substr(0,4) == 'www.') extractedDomain = extractedDomain.substr(4);
				ITEMS[sender.tab.id]['allowed'].push([cleanedUrl, fptype, extractedDomain, fpListStatus[i], false, true]);
				recentlog['allowed'].push([new Date().getTime(), sender.tab.url, fptype, extractedDomain, sender.tab.url, fpListStatus[i], false, true]);
				updateRecents('allowed');
			}
		}
	} else if (request.reqtype == 'get-list') {
		if (typeof ITEMS[request.tid] === 'undefined') {
			sendResponse('reload');
			return;
		}
		var enableval = domainCheck(request.url);
		var trustType = trustCheck(extractDomainFromURL(request.url));
		if (trustType == '1') enableval = 3;
		else if (trustType == '2') enableval = 4;
		var sessionfplist = false;
		for (var i in fpListsSession) {
			if (fpListsSession[i].length != 0) {
				sessionfplist = true;
				break;
			}
		}
		sendResponse({status: localStorage['enable'], enable: enableval, mode: localStorage['mode'], annoyancesmode: localStorage['annoyancesmode'], antisocial: localStorage['antisocial'], annoyances: localStorage['annoyances'], closepage: localStorage['classicoptions'], rating: localStorage['rating'], temp: getSessionList(), tempfp: sessionfplist, blockeditems: ITEMS[request.tid]['blocked'], alloweditems: ITEMS[request.tid]['allowed'], domainsort: localStorage['domainsort']});
		changed = true;
	} else if (request.reqtype == 'update-blocked') {
		if (request.src) {
			var cleanedUrl = removeParams(request.src);
			if (typeof ITEMS[sender.tab.id]['blocked'] === 'undefined') ITEMS[sender.tab.id]['blocked'] = [];
			if (!UrlInList(cleanedUrl, ITEMS[sender.tab.id]['blocked']) || request.node == 'NOSCRIPT' || request.node == 'Canvas Fingerprint' || request.node == 'Canvas Font Access' || request.node == 'Audio Fingerprint' || request.node == 'WebGL Fingerprint' || request.node == 'Battery Fingerprint' || request.node == 'Device Enumeration' || request.node == 'Gamepad Enumeration' || request.node == 'WebVR Enumeration' || request.node == 'Bluetooth Enumeration' || request.node == 'Spoofed Timezone' || request.node == 'Client Rectangles' || request.node == 'Clipboard Interference' || request.node == 'Data URL' || request.node == 'Browser Plugins Enumeration') {
				var extractedDomain = extractDomainFromURL(request.src);
				if (extractedDomain.substr(0,4) == 'www.') extractedDomain = extractedDomain.substr(4);
				var extractedTabDomain = extractDomainFromURL(ITEMS[sender.tab.id]['url']);
				if (request.node == 'NOSCRIPT') {
					ITEMS[sender.tab.id]['blocked'].push([request.src, request.node, request.src, '-1', '-1', false, false]);
					recentlog['blocked'].push([new Date().getTime(), request.src, request.node, request.src, ITEMS[sender.tab.id]['url'], '-1', '-1', false, false]);
					updateRecents('blocked');
				} else if (request.node == 'Canvas Fingerprint' || request.node == 'Canvas Font Access' || request.node == 'Audio Fingerprint' || request.node == 'WebGL Fingerprint' || request.node == 'Battery Fingerprint' || request.node == 'Device Enumeration' || request.node == 'Gamepad Enumeration' || request.node == 'WebVR Enumeration' || request.node == 'Bluetooth Enumeration' || request.node == 'Spoofed Timezone' || request.node == 'Client Rectangles' || request.node == 'Clipboard Interference' || request.node == 'Data URL' || request.node == 'Browser Plugins Enumeration') {
					ITEMS[sender.tab.id]['blocked'].push([request.src, request.node, extractedDomain, '-1', '-1', false, true]);
					recentlog['blocked'].push([new Date().getTime(), request.src, request.node, extractedDomain, ITEMS[sender.tab.id]['url'], '-1', '-1', false, true]);
					updateRecents('blocked');
				} else {
					var blockedDomainCheck = domainCheck(request.src, 1);
					var blockedTabDomainCheck = domainCheck(extractedTabDomain, 1);
					var blockedDomainBaddieCheck = baddies(request.src, localStorage['annoyancesmode'], localStorage['antisocial'], 2);
					ITEMS[sender.tab.id]['blocked'].push([cleanedUrl, request.node, extractedDomain, blockedDomainCheck, blockedTabDomainCheck, blockedDomainBaddieCheck, false]);
					recentlog['blocked'].push([new Date().getTime(), request.src, request.node, extractedDomain, ITEMS[sender.tab.id]['url'], blockedDomainCheck, blockedTabDomainCheck, blockedDomainBaddieCheck, false]);
					updateRecents('blocked');
				}
				updateCount(sender.tab.id);
			}
		}
	} else if (request.reqtype == 'update-allowed') {
		if (request.src) {
			if (typeof ITEMS[sender.tab.id]['allowed'] === 'undefined') ITEMS[sender.tab.id]['allowed'] = [];
			var cleanedUrl = removeParams(request.src);
			if (!UrlInList(cleanedUrl, ITEMS[sender.tab.id]['allowed'])) {
				var extractedDomain = extractDomainFromURL(request.src);
				if (extractedDomain.substr(0,4) == 'www.') extractedDomain = extractedDomain.substr(4);
				var allowedDomainCheck = domainCheck(request.src, 1);
				var allowedBaddieCheck = baddies(request.src, localStorage['annoyancesmode'], localStorage['antisocial'], 2)
				ITEMS[sender.tab.id]['allowed'].push([cleanedUrl, request.node, extractedDomain, domainCheck(request.src, 1), allowedBaddieCheck]);
				recentlog['allowed'].push([new Date().getTime(), request.src, request.node, extractedDomain, request.src, domainCheck(request.src, 1), allowedBaddieCheck]);
				updateRecents('allowed');
			}
		}
	} else if (request.reqtype == 'save') {
		domainHandler(request.url, request.list);
		changed = true;
	} else if (request.reqtype == 'temp') {
		tempHandler(request);
	} else if (request.reqtype == 'remove-temp') {
		removeTempHandler(request);
	} else if (request.reqtype == 'save-fp') {
		fpDomainHandler(request.url, request.list, 1);
		changed = true;
	} else if (request.reqtype == 'temp-fp') {
		fpDomainHandler(request.url, request.list, 1, 1);
		changed = true;
	} else if (request.reqtype == 'remove-temp-fp') {
		fpDomainHandler(request.url, request.list, -1, 1);
		changed = true;
	} else if (request.reqtype == 'refresh-page-icon') {
		if (request.type == '0') chrome.browserAction.setIcon({path: "../img/IconAllowed.png", tabId: request.tid});
		else if (request.type == '1') chrome.browserAction.setIcon({path: "../img/IconForbidden.png", tabId: request.tid});
		else if (request.type == '2') chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: request.tid});
	} else
		sendResponse({});
});
chrome.runtime.onUpdateAvailable.addListener(function (details) {
	// do nothing, wait for user to reload browser before updating.
});
chrome.commands.onCommand.addListener(function (command) {
    if (command === "temppage") {
		tempPage();
    } else if (command === "removetemppage") {
		removeTempPage();
    } else if (command === "removetempall") {
		removeTempAll();
    }
});
function reinitContext() {
	chrome.contextMenus.removeAll(function() {
		if (localStorage['showcontext'] == 'true') genContextMenu();
	});
}
function genContextMenu() {
	var parent = chrome.contextMenus.create({"title": "ScriptSafe", "contexts": ["page"]});
	if (localStorage['mode'] == 'block') {
		chrome.contextMenus.create({"title": getLocale("allow"), "parentId": parent, "onclick": function() { contextHandle('allow'); }});
		chrome.contextMenus.create({"title": getLocale("allow")+' ('+getLocale("temp")+')', "parentId": parent, "onclick": function() { contextHandle('allowtemp'); }});
		chrome.contextMenus.create({"title": getLocale("allowallblocked"), "parentId": parent, "onclick": tempPage});
		chrome.contextMenus.create({"title": getLocale("trust"), "parentId": parent, "onclick": function() { contextHandle('trust'); }});
	} else {
		chrome.contextMenus.create({"title": getLocale("deny"), "parentId": parent, "onclick": function() { contextHandle('block'); }});
		chrome.contextMenus.create({"title": getLocale("deny")+' ('+getLocale("temp")+')', "parentId": parent, "onclick": function() { contextHandle('blocktemp'); }});
		chrome.contextMenus.create({"title": getLocale("blockallallowed"), "parentId": parent, "onclick": tempPage});
		chrome.contextMenus.create({"title": getLocale("distrust"), "parentId": parent, "onclick": function() { contextHandle('distrust'); }});
	}
	chrome.contextMenus.create({"parentId": parent, "type": "separator"});
	chrome.contextMenus.create({"title": getLocale("clear"), "parentId": parent, "onclick": function() { contextHandle('clear'); }});
	chrome.contextMenus.create({"title": getLocale("revoketemp"), "parentId": parent, "onclick": removeTempPage});
	chrome.contextMenus.create({"title": getLocale("revoketempall"), "parentId": parent, "onclick": removeTempAll});
	chrome.contextMenus.create({"parentId": parent, "type": "separator"});
	chrome.contextMenus.create({"title": getLocale("options"), "parentId": parent, "onclick": function() { chrome.tabs.create({ url: chrome.extension.getURL('html/options.html')}); }});
	if (localStorage["enable"] == "false") chrome.contextMenus.create({"title": getLocale("enabless"), "parentId": parent, "onclick": function() { localStorage["enable"] = "true"; contextHandle('toggle'); }});
	else chrome.contextMenus.create({"title": getLocale("disable"), "parentId": parent, "onclick": function() { localStorage["enable"] = "false"; contextHandle('toggle'); }});
}
function contextHandle(mode) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (tabs[0].url.indexOf('http') == 0) {
			var tabdomain = extractDomainFromURL(tabs[0].url);
			var domainCheckStatus = domainCheck(tabs[0].url);
			if (mode == 'allow') {
				domainHandler(tabdomain, 2, 1);
				domainHandler(tabdomain, 0);
			} else if (mode == 'block') {
				domainHandler(tabdomain, 2, 1);
				domainHandler(tabdomain, 1);
			} else if (mode == 'allowtemp' && domainCheckStatus == '-1') tempHandler({reqtype: "temp", url: tabdomain, mode: 'block'});
			else if (mode == 'blocktemp' && domainCheckStatus == '-1') tempHandler({reqtype: "temp", url: tabdomain, mode: 'allow'});
			else if (mode == 'trust') topHandler(tabdomain, 0);
			else if (mode == 'distrust') topHandler(tabdomain, 1);
			else if (mode == 'clear') {
				if (trustCheck(tabdomain)) domainHandler('**.'+getDomain(tabdomain), 2);
				else {
					domainHandler(tabdomain, 2, 1);
					domainHandler(tabdomain, 2);
				}
			} else if (mode == 'toggle') reinitContext();
			if (localStorage['refresh'] == 'true') chrome.tabs.reload(tabs[0].id);
		}
	}); 
}
function tempPage() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tempMode = localStorage['mode'];
		if (typeof ITEMS[tabs[0].id][tempMode+'ed'] === 'undefined') return;
		var tempDomainList = [];
		if (domainCheck(tabs[0].url, 2) == '-1') {
			if ((tempMode == 'block' && enabled(tabs[0].url) == 'true') || (tempMode == 'allow' && enabled(tabs[0].url) == 'false'))
				tempDomainList.push(extractDomainFromURL(tabs[0].url));
		}
		ITEMS[tabs[0].id][tempMode+'ed'].map(function(items) {
			if (items[3] == '-1') tempDomainList.push(items[2]);
		});
		tempHandler({reqtype: "temp", url: tempDomainList, mode: tempMode});
		if (localStorage['refresh'] == 'true') chrome.tabs.reload(tabs[0].id);
	});
}
function removeTempPage() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tempMode;
		if (localStorage['mode'] == 'block') tempMode = 'allow';
		else tempMode = 'block';
		if (typeof ITEMS[tabs[0].id][tempMode+'ed'] === 'undefined') return;
		var tempDomainList = [];
		if (domainCheck(tabs[0].url, 2) == '-1') {
			if ((tempMode == 'block' && enabled(tabs[0].url) == 'true') || (tempMode == 'allow' && enabled(tabs[0].url) == 'false'))
				tempDomainList.push(extractDomainFromURL(tabs[0].url));
		}
		ITEMS[tabs[0].id][tempMode+'ed'].map(function(items) {
			tempDomainList.push(items[2]);
		});
		removeTempHandler({reqtype: "remove-temp", url: tempDomainList});
		if (localStorage['refresh'] == 'true') chrome.tabs.reload(tabs[0].id);
	});
}
function removeTempAll() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		revokeTemp();
		if (localStorage['refresh'] == 'true') chrome.tabs.reload(tabs[0].id);
	});
}
function ssCompress(str) {
	return btoa(pako.deflate(str, { to: 'string' }));
}
function ssDecompress(str) {
	return pako.inflate(atob(str), { to: 'string' });
}
function freshSync(force) {
	if (storageapi && localStorage['syncenable'] == 'true') {
		window.clearTimeout(synctimer);
		if (force) {
			localStorage['sync'] = 'true';
			var settingssync = {};
			var simplesettings = '';
			var newlimit = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 6 - 13;
			var fpsettings = '';
			var zarr = {};
			zarr['zw'] = [];
			zarr['zb'] = [];
			zarr['sw'] = [];
			zarr['sb'] = [];
			zarr['sf'] = [];
			zarr['su'] = [];
			var milliseconds = (new Date).getTime();
			var limit;
			var segment;
			var jsonstr;
			var i = 0;
			for (var k in localStorage) {
				if (localStorage.hasOwnProperty(k)) {
					// legacy syncing method - start
						if (k != "version" && k != "sync" && k != "scriptsafe_settings" && k != "lastSync" && k != "whiteList" && k != "blackList" && k != "useragent" && k != "whiteListCount" && k != "blackListCount" && k != "whiteListCount2" && k != "blackListCount2" && k != "useragentCount2" && k.substr(0, 10) != "whiteList_" && k.substr(0, 10) != "blackList_" && k.substr(0, 2) != "zb" && k.substr(0, 2) != "zw" && k.substr(0, 2) != "sw" && k.substr(0, 2) != "sb" && k.substr(0, 2) != "sf" && k.substr(0, 2) != "su") {
					// legacy syncing method - end
					// new syncing method - start
						//if (k != "version" && k != "sync" && k != "scriptsafe_settings" && k != "lastSync" && k != "whiteList" && k != "blackList" && k != "useragent" && k != "whiteListCount" && k != "blackListCount" && k != "whiteListCount2" && k != "blackListCount2" && k != "useragentCount2" && k.substr(0, 10) != "whiteList_" && k.substr(0, 10) != "blackList_" && k.substr(0, 2) != "zb" && k.substr(0, 2) != "zw" && k.substr(0, 2) != "sw" && k.substr(0, 2) != "sb" && k.substr(0, 2) != "sf" && k.substr(0, 2) != "su" && k.substr(0, 2) != "fp") {
					// new syncing method - end
						simplesettings += k+"|"+localStorage[k]+"~";
					// new syncing method - start
						/*
						} else if (k.substr(0, 2) == "fp" && k != "fpCount") {
							fpsettings += k+"|"+localStorage[k]+"~";
						*/
					// new syncing method - end
					}
					if (k.substr(0, 2) == "zw") zarr['zw'].push(k);
					else if (k.substr(0, 2) == "zb") zarr['zb'].push(k);
					else if (k.substr(0, 2) == "sw") zarr['sw'].push(k);
					else if (k.substr(0, 2) == "sb") zarr['sb'].push(k);
					else if (k.substr(0, 2) == "sf") zarr['sf'].push(k);
					else if (k.substr(0, 2) == "su") zarr['su'].push(k);
				}
			}
			settingssync['scriptsafe_settings'] = simplesettings.slice(0,-1);
			if (zarr['zw'].length) {
				for (var x = 0, forcount=zarr['zw'].length; x < forcount; x++) delete localStorage[zarr['zw'][x]];
			}
			if (zarr['sw'].length) {
				for (var x = 0, forcount=zarr['sw'].length; x < forcount; x++) delete localStorage[zarr['sw'][x]];
			}
			// legacy syncing method - start
				jsonstr = JSON.parse(localStorage['whiteList']).toString();
				i = 0;
				limit = (chrome.storage.sync.QUOTA_BYTES_PER_ITEM - Math.ceil(jsonstr.length/(chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 4)) - 4);
				while (jsonstr.length > 0) {
					segment = jsonstr.substr(0, limit);
					settingssync["zw" + i] = segment;
					jsonstr = jsonstr.substr(limit);
					i++;
				}
				settingssync['whiteListCount'] = i;
			// legacy syncing method - end
			// new syncing method - start
				/*
				jsonstr = ssCompress(JSON.parse(localStorage['whiteList']).toString());
				i = 0;
				while (jsonstr.length > 0) {
					segment = jsonstr.substr(0, newlimit);
					settingssync["sw" + i] = milliseconds+segment;
					jsonstr = jsonstr.substr(newlimit);
					i++;
				}
				settingssync['whiteListCount2'] = i;
				if (zarr['zb'].length) {
					for (var x = 0, forcount=zarr['zb'].length; x < forcount; x++) delete localStorage[zarr['zb'][x]];
				}
				if (zarr['sb'].length) {
					for (var x = 0, forcount=zarr['sb'].length; x < forcount; x++) delete localStorage[zarr['sb'][x]];
				}
				*/
			// new syncing method - end
			// legacy syncing method - start
				i = 0;
				jsonstr = JSON.parse(localStorage['blackList']).toString();
				limit = (chrome.storage.sync.QUOTA_BYTES_PER_ITEM - Math.ceil(jsonstr.length/(chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 4)) - 4);
				while (jsonstr.length > 0) {
					segment = jsonstr.substr(0, limit);
					settingssync["zb" + i] = segment;
					jsonstr = jsonstr.substr(limit);
					i++;
				}
				settingssync['blackListCount'] = i;
			// legacy syncing method - end
			// new syncing method - start
			/*
				jsonstr = ssCompress(JSON.parse(localStorage['blackList']).toString());
				i = 0;
				while (jsonstr.length > 0) {
					segment = jsonstr.substr(0, newlimit);
					settingssync["sb" + i] = milliseconds+segment;
					jsonstr = jsonstr.substr(newlimit);
					i++;
				}
				settingssync['blackListCount2'] = i;
				if (zarr['sf'].length) {
					for (var x = 0, forcount=zarr['sf'].length; x < forcount; x++) delete localStorage[zarr['sf'][x]];
				}
				i = 0;
				jsonstr = ssCompress(fpsettings.slice(0,-1));
				while (jsonstr.length > 0) {
					segment = jsonstr.substr(0, newlimit);
					settingssync["sf" + i] = milliseconds+segment;
					jsonstr = jsonstr.substr(newlimit);
					i++;
				}
				settingssync['fpCount'] = i;
			*/
			// new syncing method - end
			jsonstr = ssCompress(JSON.parse(localStorage['useragent']).toString());
			if (zarr['su'].length) {
				for (var x = 0, forcount=zarr['su'].length; x < forcount; x++) delete localStorage[zarr['su'][x]];
			}
			i = 0;
			while (jsonstr.length > 0) {
				segment = jsonstr.substr(0, newlimit);
				settingssync["su" + i] = milliseconds+segment;
				jsonstr = jsonstr.substr(newlimit);
				i++;
			}
			settingssync['useragentCount2'] = i;
			settingssync['lastSync'] = milliseconds;
			localStorage['lastSync'] = milliseconds;
			if (chrome.storage.sync.QUOTA_BYTES < JSON.stringify(settingssync).length) {
				alert('ScriptSafe cannot sync your settings as it is greater than the total limit.\r\nHowever, you can manually export and import your settings by going to the Options page.');
			} else {
				chrome.storage.sync.clear(function() {
					chrome.storage.sync.set(settingssync, function() {
						if (chrome.extension.lastError){
							alert(chrome.extension.lastError.message);
						} else {
							if (localStorage['syncnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - '+getLocale("exportsuccesstitle"), 'message': getLocale("exportsuccess")}, function(callback) { return true; } );
						}
					});
				});
			}
		} else {
			synctimer = window.setTimeout(function() { syncQueue() }, 10000);
		}
		return true;
	} else {
		return false;
	}
}
function syncQueue() {
	freshSync(true);
}
function importSyncHandle(mode) {
	if (storageapi) {
		if (mode == '1' || localStorage['syncenable'] == 'true' || localStorage['sync'] == 'false') {
			window.clearTimeout(synctimer);
			chrome.storage.sync.get(null, function(changes) {
				if (typeof changes['lastSync'] !== 'undefined') {
					if ((mode == '0' && changes['lastSync'] > localStorage['lastSync']) || (mode == '1' && changes['lastSync'] >= localStorage['lastSync'])) {
						if (confirm(getLocale("syncdetect"))) {
							localStorage['syncenable'] = 'true';
							localStorage['sync'] = 'true';
							importSync(changes);
							if (mode == '1') window.setTimeout(function() { window.clearTimeout(synctimer); }, 5000);
							if (localStorage['syncfromnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - '+getLocale("importsuccesstitle"), 'message': getLocale("importsuccess")}, function(callback) { updated = true; return true; });
							return true;
						} else {
							if (mode != '1') {
								localStorage['syncenable'] = 'false';
								alert(getLocale("syncdisabled"));
								localStorage['sync'] = 'true';
							}
							return false;
						}
					}
				}
				if (mode == '1' || (localStorage['sync'] == 'false' && mode == '0')) {
					localStorage['syncenable'] = 'false';
					localStorage['sync'] = 'true';
					return false;
				}
			});
		}
	} else {
		alert(getLocale("syncnotsupported"));
		localStorage['sync'] = 'true';
		return false;
	}
}
function importSync(changes) {
	for (var key in changes) {
		if (key != 'scriptsafe_settings') {
			localStorage[key] = changes[key];
		} else if (key == 'scriptsafe_settings') {
			var settings = changes[key].split("~");
			if (settings.length > 0) {
				$.each(settings, function(i, v) {
					if ($.trim(v) != "") {
						var settingentry = $.trim(v).split("|");
						if ($.trim(settingentry[1]) != '') {
							localStorage[$.trim(settingentry[0])] = $.trim(settingentry[1]);
						}
					}
				});
			}
		}
	}
	initLang(localStorage['locale'], 0);
	listsSync();
}
function listsSync() {
	listsSyncParse('whiteList');
	listsSyncParse('blackList');
	listsSyncParse('useragent');
	if (optionExists('fpCount')) {
		var concatlist = '';
		var listerror = false;
		for (var i = 0, forcount=localStorage['fpCount']; i < forcount; i++) {
			if (localStorage['sf'+i]) {
				if (localStorage['sf'+i].substr(0, 13) == localStorage['lastSync']) concatlist += localStorage['sf'+i].substr(13);
				else listerror = true;
				delete localStorage['sf'+i];
			}
		}
		if (!listerror) {
			if (concatlist != '') {
				concatlist = ssDecompress(concatlist);
				var settings = concatlist.split("~");
				if (settings.length > 0) {
					$.each(settings, function(i, v) {
						if ($.trim(v) != "") {
							var settingentry = $.trim(v).split("|");
							if ($.trim(settingentry[1]) != '') {
								localStorage[$.trim(settingentry[0])] = $.trim(settingentry[1]);
							}
						}
					});
				}
			}
		} else {
			alert('Incomplete fingerprint whitelist data was detected. Very large lists are known to cause issues with syncing.\r\nAs a safety precaution, your fingerprint whitelist has not been updated and syncing has been disabled on this device to prevent overwriting data on other devices.\r\nPlease consider manually exporting your latest settings and importing it into your other devices from the Options page.');
			localStorage['syncenable'] = 'false';
		}
		delete localStorage['fpCount'];
	}
	cacheLists();
	cacheFpLists();
}
function listsSyncParse(type) {
	if (optionExists(type+'Count') || optionExists(type+'Count2')) {
		var lsName = type.substr(0,1);
		var concatlist = '';
		var concatlistarr = [];
		var counttype;
		var listerror = false;
		if (optionExists(type+'Count2')) counttype = type+'Count2';
		else counttype = type+'Count';
		concatlist = '';
		if (localStorage[counttype] != '0') {
			for (var i = 0, forcount=localStorage[counttype]; i < forcount; i++) {
				if (counttype == type+'Count2') {
					if (localStorage['s'+lsName+i]) {
						if (localStorage['s'+lsName+i].substr(0, 13) == localStorage['lastSync']) concatlist += localStorage['s'+lsName+i].substr(13);
						else {
							listerror = true;
						}
						delete localStorage['s'+lsName+i];
					} else {
						listerror = true;
					}
				} else if (counttype == type+'Count') {
					if (localStorage['z'+lsName+i]) {
						concatlist += localStorage['z'+lsName+i];
						delete localStorage['z'+lsName+i];
					} else {
						listerror = true;
					}
				}
			}
			if (!listerror) {
				if (counttype == type+'Count2') concatlist = ssDecompress(concatlist);
				concatlistarr = concatlist.split(",");
			}
		}
		if (!listerror) {
			if (concatlist == '' || concatlistarr.length == 0) localStorage[type+''] = JSON.stringify([]);
			else localStorage[type+''] = JSON.stringify(concatlistarr);
		} else {
			alert('Incomplete '+type.toLowerCase()+' data was detected. Very large lists are known to cause issues with syncing.\r\nAs a safety precaution, your '+type.toLowerCase()+' has not been updated and syncing has been disabled on this device to prevent overwriting data on other devices.\r\nPlease consider manually exporting your latest settings and importing it into your other devices from the Options page.');
			localStorage['syncenable'] = 'false';
		}
		if (optionExists(type+'Count2')) delete localStorage[type+'Count2'];
		if (optionExists(type+'Count')) delete localStorage[type+'Count'];
	}
}
function getUpdated() {
	return updated;
}
function setUpdated() {
	updated = false;
}
function triggerUpdated() {
	updated = true;
	freshSync();
}
function init() {
	webrtcsupport = checkWebRTC();
	initWebRTC();
	cacheLists();
	cacheFpLists();
	if (localStorage['showcontext'] == 'true') genContextMenu();
}
function cacheLists() {
	var tempList = JSON.parse(localStorage['whiteList']);
	var tempDomain = [];
	var tempWildDomain = [];
	tempList.map(function(domain) {
		if (domain.substr(0,3) == '**.') tempWildDomain.push(domain);
		tempDomain.push(domain);
	});
	tempDomain = tempDomain.sort();
	whiteList = tempDomain;
	tempWildDomain = tempWildDomain.sort();
	trustList = tempWildDomain;
	tempList = JSON.parse(localStorage['blackList']);
	tempDomain = [];
	tempWildDomain = [];
	tempList.map(function(domain) {
		if (domain.substr(0,3) == '**.') tempWildDomain.push(domain);
		tempDomain.push(domain);
	});
	tempDomain = tempDomain.sort();
	blackList = tempDomain;
	tempWildDomain = tempWildDomain.sort();
	distrustList = tempWildDomain;
}
function cacheFpLists() {
	for (var i in fpTypes) {
		var tempList = JSON.parse(localStorage[fpTypes[i]]);
		var tempDomain = [];
		tempList.map(function(domain) {
			tempDomain.push(domain);
		});
		tempDomain = tempDomain.sort();
		fpLists[fpTypes[i]] = tempDomain;
	}
}
function initLang(lang, mode) {
	var url = chrome.extension.getURL('_locales/' + lang + '/messages.json');
	$.ajax({
		url: url,
		dataType: 'json',
		async: true,
		success: function(data) {
			locale = data;
			if (mode == '1') postLangLoad();
			else reinitContext();
		},
		error: function(){
			locale = false;
			if (mode == '1') postLangLoad();
			else reinitContext();
		}
	});
}
function getLocale(str) {
	if (locale) {
		if (typeof locale[str] === 'undefined') return chrome.i18n.getMessage(str);
		return locale[str].message;
	} else {
		return chrome.i18n.getMessage(str);
	}
}
function getLangs() {
	return langs;
}
var uiLang = chrome.i18n.getUILanguage().replace(/-/g, '_');
if (!optionExists("locale")) {
	localStorage['locale'] = 'en_US';
	if (uiLang != 'en' && uiLang != 'en_GB' && uiLang != 'en_US') {
		if (typeof langs[uiLang] !== 'undefined') {
			if (confirm('ScriptSafe detected that your browser is currently set to '+langs[uiLang]+'.\r\nWould you like to use ScriptSafe in '+langs[uiLang]+'?\r\nIf you click on "Cancel", English (US) will be set.')) {
				localStorage['locale'] = uiLang;
			}
		}
	}
} else {
	if (typeof langs[uiLang] === 'undefined') {
		localStorage['locale'] = 'en_US';
	}
}
initLang(localStorage['locale'], 1);
function postLangLoad() {
	if (!optionExists("version") || localStorage["version"] != version) {
		// One-time update existing whitelist/blacklist for new regex support introduced in v1.0.7.0
		if (!optionExists("tempregexflag")) {
			if (optionExists("version")) {
				var tempList = JSON.parse(localStorage['blackList']);
				var tempNewList = [];
				if (tempList.length) {
					tempList.map(function(domain) {
						if (domain.substr(0,2) == '*.') tempNewList.push('*'+domain);
						else tempNewList.push(domain);
					});
					localStorage['blackList'] = JSON.stringify(tempNewList);
				}
				tempList = JSON.parse(localStorage['whiteList']);
				if (tempList.length) {
					tempNewList = [];
					tempList.map(function(domain) {
						if (domain.substr(0,2) == '*.') tempNewList.push('*'+domain);
						else tempNewList.push(domain);
					});
					localStorage['whiteList'] = JSON.stringify(tempNewList);
				}
			}
			localStorage['tempregexflag'] = "true";
			syncQueue();
		}
		if (localStorage["updatenotify"] == "true") {
			chrome.tabs.create({ url: chrome.extension.getURL('html/updated.html')});
		}
		localStorage["version"] = version;
	}
	setDefaultOptions();
	if (typeof chrome.storage !== 'undefined') {
		storageapi = true;
	}
	if (typeof chrome.webRequest !== 'undefined') {
		if (experimental == 0) experimental = 1;
		var requestUrls = ["http://*/*", "https://*/*"];
		refreshRequestTypes();
		if (typeof chrome.webRequest !== 'undefined') {
			chrome.webRequest.onBeforeRequest.addListener(ScriptSafe, {"types": requestTypes, "urls": requestUrls}, ['blocking']);
			chrome.webRequest.onBeforeSendHeaders.addListener(mitigate, {"types": requestTypes, "urls": requestUrls}, ['requestHeaders', 'blocking']);
			chrome.webRequest.onHeadersReceived.addListener(inlineblock, {"types": requestTypes, "urls": requestUrls}, ['responseHeaders', 'blocking']);
		}
	}
	if (storageapi) {
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			if (namespace == 'sync' && localStorage['syncenable'] == 'true') {
				if (typeof changes['lastSync'] !== 'undefined') {
					if (changes['lastSync'].newValue && changes['lastSync'].newValue > localStorage['lastSync']) {
						chrome.storage.sync.get(null, function(changes) {
							importSync(changes);
							if (localStorage['syncfromnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - '+getLocale("importsuccesstitle"), 'message': getLocale("importsuccess")}, function(callback) { updated = true; return true; });
						});
					}
				}
			}
		});
		importSyncHandle(0);
	}
	init();
}