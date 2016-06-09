// Credits and ideas: NotScripts, AdBlock Plus for Chrome, Ghostery, KB SSL Enforcer
'use strict';
var version = (function () {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
	xhr.send(null);
	return JSON.parse(xhr.responseText).version;
}());
var requestTypes, synctimer, blackList, whiteList, distrustList, trustList, sessionBlackList, sessionWhiteList;
var popup = [];
var changed = false;
const ITEMS = {};
var experimental = 0;
var storageapi = false;
function refreshRequestTypes() {
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
	if (!checkWebRTC()) return;
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
function checkWebRTC() {
	if (typeof chrome.privacy.network.webRTCIPHandlingPolicy === 'undefined') return false;
	return true;
}
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
function mitigate(req) {
	if (localStorage["enable"] == "false" || (localStorage['useragentspoof'] == 'off' && localStorage['cookies'] == 'false' && localStorage['referrerspoof'] == 'off')) {
		return;
	}
	for (var i = 0; i < req.requestHeaders.length; i++) {
		if (req.requestHeaders[i].name == 'User-Agent' || req.requestHeaders[i].name == 'Referer' || req.requestHeaders[i].name == 'Cookie') {
			switch (req.requestHeaders[i].name) {
				case 'Cookie':
					if (localStorage['cookies'] == 'true' && baddies(req.url, localStorage['annoyancesmode'], localStorage['antisocial'])) 
						req.requestHeaders[i].value = '';
					break;
				case 'Referer':
					if (localStorage['referrerspoof'] == 'same')
						req.requestHeaders[i].value = req.url;
					else if (localStorage['referrerspoof'] == 'domain')
						req.requestHeaders[i].value = req.url.split("//")[0]+'//'+req.url.split("/")[2];
					else if (localStorage['referrerspoof'] != 'off')
						req.requestHeaders[i].value = localStorage['referrerspoof'];
					break;
				case 'User-Agent':
					if (localStorage['useragentspoof'] != 'off' && enabled(req.url) == 'true') {
						var os;
						if (localStorage['useragentspoof_os'] == 'w7') os = 'Windows; U; Windows NT 6.1';
						else if (localStorage['useragentspoof_os'] == 'w10') os = 'Windows NT 10.0';
						else if (localStorage['useragentspoof_os'] == 'w8') os = 'Windows NT 6.2';
						else if (localStorage['useragentspoof_os'] == 'w81') os = 'Windows NT 6.3';
						else if (localStorage['useragentspoof_os'] == 'wv') os = 'Windows; U; Windows NT 6.0';
						else if (localStorage['useragentspoof_os'] == 'w2k3') os = 'Windows; U; Windows NT 5.2';
						else if (localStorage['useragentspoof_os'] == 'wxp') os = 'Windows; U; Windows NT 5.1';
						else if (localStorage['useragentspoof_os'] == 'w98') os = 'Windows; U; Windows 98';
						else if (localStorage['useragentspoof_os'] == 'w95') os = 'Windows; U; Windows 95';
						else if (localStorage['useragentspoof_os'] == 'linux64') os = 'X11; U; Linux x86_64';
						else if (localStorage['useragentspoof_os'] == 'linux32') os = 'X11; U; Linux x86_32';
						else if (localStorage['useragentspoof_os'] == 'macsnow') os = 'Macintosh; U; Intel Mac OS X 10_6_8';
						else if (localStorage['useragentspoof_os'] == 'chromeos') os = 'X11; U; CrOS i686 0.13.507';
						if (localStorage['useragentspoof'] == 'chrome14')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.94 Safari/535.1';
						else if (localStorage['useragentspoof'] == 'chrome13')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.43 Safari/535.1';
						else if (localStorage['useragentspoof'] == 'chrome12')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.750.0 Safari/534.30';
						else if (localStorage['useragentspoof'] == 'chrome50')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36 OPR/37.0.2178.43';
						else if (localStorage['useragentspoof'] == 'opera37')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') Presto/2.9.181 Version/12.00';
						else if (localStorage['useragentspoof'] == 'opera12')
							req.requestHeaders[i].value = 'Opera/9.80 ('+os+') Presto/2.9.181 Version/12.00';
						else if (localStorage['useragentspoof'] == 'opera11')
							req.requestHeaders[i].value = 'Opera/9.80 ('+os+') Presto/2.9.168 Version/11.50';
						else if (localStorage['useragentspoof'] == 'firefox46')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; rv:44.0) Gecko/20100101 Firefox/44.0';
						else if (localStorage['useragentspoof'] == 'firefox6')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; rv:6.0a2) Gecko/20110613 Firefox/6.0a2';
						else if (localStorage['useragentspoof'] == 'firefox5')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; rv:5.0) Gecko/20100101 Firefox/5.0';
						else if (localStorage['useragentspoof'] == 'firefox4')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; rv:2.0.1) Gecko/20110606 Firefox/4.0.1';
						else if (localStorage['useragentspoof'] == 'firefox3')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; rv:1.9.2.9) Gecko/20100913 Firefox/3.6.9';
						else if (localStorage['useragentspoof'] == 'ie11')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+'; Trident/7.0; rv:11.0) like Gecko';
						else if (localStorage['useragentspoof'] == 'ie10')
							req.requestHeaders[i].value = 'Mozilla/5.0 (compatible; MSIE 10.0; '+os+'; Trident/6.0)';
						else if (localStorage['useragentspoof'] == 'ie9')
							req.requestHeaders[i].value = 'Mozilla/5.0 (compatible; MSIE 9.0; '+os+')';
						else if (localStorage['useragentspoof'] == 'ie8')
							req.requestHeaders[i].value = 'Mozilla/4.0 (compatible; MSIE 8.0; '+os+')';
						else if (localStorage['useragentspoof'] == 'ie7')
							req.requestHeaders[i].value = 'Mozilla/4.0(compatible; MSIE 7.0; '+os+')';
						else if (localStorage['useragentspoof'] == 'ie61')
							req.requestHeaders[i].value = 'Mozilla/4.0 (compatible; MSIE 6.1; '+os+')';
						else if (localStorage['useragentspoof'] == 'ie60')
							req.requestHeaders[i].value = 'Mozilla/4.0 (compatible; MSIE 6.0; '+os+')';
						else if (localStorage['useragentspoof'] == 'safari7')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A';
						else if (localStorage['useragentspoof'] == 'safari5')
							req.requestHeaders[i].value = 'Mozilla/5.0 ('+os+') AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';
					}
					break;
			}
		}
	}
	return { requestHeaders: req.requestHeaders };
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
		if (experimental == '1' && localStorage['preservesamedomain'] == 'false' && localStorage['script'] == 'true' && enabled(req.url) == 'true') {
			headers.push({
				'name': 'Content-Security-Policy',
				'value': "script-src 'none'"
			});
		}
	}
    return { responseHeaders: headers };
}
function ScriptSafe(req) {
	if (req.tabId == -1 || req.url === 'undefined' || localStorage["enable"] == "false") {
		return { cancel: false };
	}
	if (req.type == 'main_frame') {
		if (typeof ITEMS[req.tabId] === 'undefined') {
			resetTabData(req.tabId, req.url);
		} else {
			ITEMS[req.tabId]['url'] = req.url;
		}
		return { cancel: false };
	}
	if (typeof ITEMS[req.tabId] === 'undefined') return { cancel: false };
	var reqtype = req.type;
	if (reqtype == "sub_frame") reqtype = 'frame';
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
		if (domainCheckStatus == '0' && !(tabDomainCheckStatus == '-1' && localStorage['mode'] == 'block' && localStorage['paranoia'] == 'true')) thirdPartyCheck = false;
		else thirdPartyCheck = thirdParty(req.url, extractedDomain);
		if ((tabDomainCheckStatus == '-1' && localStorage['mode'] == 'block' && localStorage['paranoia'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && localStorage['mode'] == 'block'))) || ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (localStorage['antisocial'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	if (elementStatusCheck && baddiesCheck && reqtype == "image") reqtype = 'webbug';
	if ((reqtype == "frame" && (localStorage['iframe'] == 'true' || localStorage['frame'] == 'true')) || (reqtype == "script" && localStorage['script'] == 'true') || (reqtype == "object" && (localStorage['object'] == 'true' || localStorage['embed'] == 'true')) || (reqtype == "image" && localStorage['image'] == 'true') || reqtype == "webbug" || (reqtype == "xmlhttprequest" && ((localStorage['xml'] == 'true' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || localStorage['xml'] == 'all'))) {
		// request qualified for filtering, so continue.
	} else {
		return { cancel: false };
	}
	if (elementStatusCheck && ((localStorage['preservesamedomain'] == 'true' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || localStorage['preservesamedomain'] == 'false')) {
		if (typeof ITEMS[req.tabId]['blocked'] === 'undefined') ITEMS[req.tabId]['blocked'] = [];
		if (!UrlInList(removeParams(req.url), ITEMS[req.tabId]['blocked'])) {
			if (extractedReqDomain.substr(0,4) == 'www.') extractedReqDomain = extractedReqDomain.substr(4);
			ITEMS[req.tabId]['blocked'].push([removeParams(req.url), reqtype.toUpperCase(), extractedReqDomain, domainCheckStatus, tabDomainCheckStatus, baddiesCheck]);
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
		if (!UrlInList(removeParams(req.url), ITEMS[req.tabId]['allowed'])) {
			if (extractedReqDomain.substr(0,4) == 'www.') extractedReqDomain = extractedReqDomain.substr(4);
			ITEMS[req.tabId]['allowed'].push([removeParams(req.url), reqtype.toUpperCase(), extractedReqDomain, domainCheckStatus, baddiesCheck]);
		}
	}
	return { cancel: false };
}
function enabled(url) {
	var domainCheckStatus = domainCheck(url);
	if (localStorage["enable"] == "true" && domainCheckStatus != '0' && (domainCheckStatus == '1' || (localStorage["mode"] == "block" && domainCheckStatus == '-1')) && url.indexOf('https://chrome.google.com/webstore') == -1) 
		return 'true';
	return 'false';
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
				split_hosts.push([getDomain(hosts[h][2]), hosts[h][0], hosts[h][1], hosts[h][2], hosts[h][3], hosts[h][4], hosts[h][5]]);
			}
			split_hosts.sort();
			for (var h in split_hosts) {
				sorted_hosts.push([split_hosts[h][1], split_hosts[h][2], split_hosts[h][3], split_hosts[h][4], split_hosts[h][5], split_hosts[h][6]]);
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
		domainHandler(domain, mode);
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
					if (confirm('ScriptSafe detected '+(whiteInstancesCount+blackInstancesCount)+' existing rule(s) for '+tempDomain+' ('+whiteInstancesCount+' whitelist and '+blackInstancesCount+' blacklist).\r\nDo you want to delete them in order to avoid conflicts?\r\nNote: this might not necessarily remove all conflicting entries, particularly if they use regex (e.g. d?main.com).')) {
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
						var lingo = '';
						if (action == 1) lingo = 'dis';
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
function setDefaultOptions() {
	defaultOptionValue("version", version);
	defaultOptionValue("sync", "false");
	defaultOptionValue("syncenable", "false");
	defaultOptionValue("syncnotify", "true");
	defaultOptionValue("syncfromnotify", "true");
	defaultOptionValue("updatenotify", "true");
	defaultOptionValue("updatemessagenotify", "true");
	defaultOptionValue("enable", "true");
	defaultOptionValue("mode", "block");
	defaultOptionValue("refresh", "true");
	defaultOptionValue("script", "true");
	defaultOptionValue("noscript", "false");
	defaultOptionValue("object", "true");
	defaultOptionValue("applet", "true");
	defaultOptionValue("embed", "true");
	defaultOptionValue("iframe", "true");
	defaultOptionValue("frame", "true");
	defaultOptionValue("audio", "true");
	defaultOptionValue("video", "true");
	defaultOptionValue("image", "false");
	defaultOptionValue("xml", "true");
	defaultOptionValue("annoyances", "true");
	defaultOptionValue("annoyancesmode", "relaxed");
	defaultOptionValue("antisocial", "false");
	defaultOptionValue("preservesamedomain", "false");
	defaultOptionValue("webbugs", "true");
	defaultOptionValue("webrtc", "default_public_interface_only");
	defaultOptionValue("classicoptions", "false");
	defaultOptionValue("rating", "true");
	defaultOptionValue("referrer", "true");
	defaultOptionValue("linktarget", "off");
	defaultOptionValue("domainsort", "true");
	defaultOptionValue("useragentspoof", "off");
	defaultOptionValue("useragentspoof_os", "off");
	defaultOptionValue("referrerspoof", "off");
	defaultOptionValue("cookies", "true");
	defaultOptionValue("paranoia", "false");
	if (!optionExists("blackList")) localStorage['blackList'] = JSON.stringify([]);
	if (!optionExists("whiteList")) localStorage['whiteList'] = JSON.stringify(["*.googlevideo.com"]);
	if (typeof sessionStorage['blackList'] === "undefined") sessionStorage['blackList'] = JSON.stringify([]);
	if (typeof sessionStorage['whiteList'] === "undefined") sessionStorage['whiteList'] = JSON.stringify([]);
	chrome.browserAction.setBadgeBackgroundColor({color:[208, 0, 24, 255]});
}
function updateCount(tabId) {
	const TAB_ITEMS = ITEMS[tabId] || (ITEMS[tabId] = [0]);
	const TAB_BLOCKED_COUNT = ++TAB_ITEMS[0];
	chrome.browserAction.setBadgeBackgroundColor({ color: [208, 0, 24, 255], tabId: tabId });
	chrome.browserAction.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
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
	sessionStorage['blackList'] = JSON.stringify([]);
	sessionStorage['whiteList'] = JSON.stringify([]);
}
function statuschanger() {
	if (localStorage['enable'] == 'true') {
		localStorage['enable'] = 'false';
		chrome.browserAction.setIcon({path: "../img/IconDisabled.png"});
	} else {
		localStorage['enable'] = 'true';
		chrome.browserAction.setIcon({path: "../img/IconForbidden.png"});
	}
}
function tempHandler(request) {
	if (typeof request.url === 'object') {
		for (var i=0;i<request.url.length;i++) {
			if (request.url[i][0] != 'no.script' && request.url[i][0] != 'web.bug') {
				var requesturl = request.url[i];
				var baddiesStatus = baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']);
				if ((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddiesStatus == 1) || (localStorage['antisocial'] == 'true' && baddiesStatus == '2')) {
					// do nothing
				} else {
					if (request.mode == 'block') domainHandler(requesturl, 0, 1);
					else domainHandler(requesturl, 1, 1);
				}
			}
		}
	} else {
		var requesturl = request.url;
		var baddiesStatus = baddies(requesturl, localStorage['annoyancesmode'], localStorage['antisocial']);
		if ((localStorage['annoyances'] == 'true' && localStorage['annoyancesmode'] == 'strict' && baddiesStatus == 1) || (localStorage['antisocial'] == 'true' && baddiesStatus == '2')) {
			// do nothing
		} else {
			if (request.mode == 'block') domainHandler(requesturl, 0, 1);
			else domainHandler(requesturl, 1, 1);
		}
	}
	changed = true;
}
function removeTempHandler(request) {
	if (typeof request.url === 'object') {
		for (var i=0;i<request.url.length;i++) {
			domainHandler(request.url[i], 2, 1);
		}
	} else {
		domainHandler(request.url, 2, 1);
	}
	changed = true;
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
				if (localStorage['referrer'] == 'true') {
					chrome.tabs.executeScript(tabid, {code: 'blockreferrer()', allFrames: true});
				}
				chrome.tabs.executeScript(tabid, {code: 'loaded()', allFrames: true});
				changed = true;
				if (localStorage['mode'] == 'block' && typeof ITEMS[tabid]['allowed'] !== 'undefined') {
					for (var i=0; i<ITEMS[tabid]['allowed'].length; i++) {
						if (in_array(extractDomainFromURL(ITEMS[tabid]['allowed'][i][0]), sessionWhiteList))
							chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: tabid});
					}
				} else if (localStorage['mode'] == 'allow' && typeof ITEMS[tabid]['blocked'] !== 'undefined') {
					for (var i=0; i<ITEMS[tabid]['blocked'].length; i++) {
						if (in_array(extractDomainFromURL(ITEMS[tabid]['blocked'][i][0]), sessionBlackList))
							chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: tabid});
					}
				}
			}
		}
	} else chrome.browserAction.setIcon({path: "../img/IconDisabled.png", tabId: tabid});
});
chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (port.name == 'popuplifeline') {
			if (msg.url && msg.tid) {
				popup=[msg.url, msg.tid];
			}
		}
	});
	port.onDisconnect.addListener(function(msg) {
		if (popup.length > 0) {
			if (localStorage['refresh'] == 'true') chrome.tabs.update(popup[1], {url: popup[0]});
			popup=[];
		}
	});
});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.reqtype == 'get-settings') {
		sendResponse({status: localStorage['enable'], enable: enabled(sender.tab.url), experimental: experimental, mode: localStorage['mode'], annoyancesmode: localStorage['annoyancesmode'], antisocial: localStorage['antisocial'], whitelist: whiteList, blacklist: blackList, whitelistSession: sessionWhiteList, blackListSession: sessionBlackList, script: localStorage['script'], noscript: localStorage['noscript'], object: localStorage['object'], applet: localStorage['applet'], embed: localStorage['embed'], iframe: localStorage['iframe'], frame: localStorage['frame'], audio: localStorage['audio'], video: localStorage['video'], image: localStorage['image'], annoyances: localStorage['annoyances'], preservesamedomain: localStorage['preservesamedomain'], webbugs: localStorage['webbugs'], referrer: localStorage['referrer'], linktarget: localStorage['linktarget'], paranoia: localStorage['paranoia']});
		if (typeof ITEMS[sender.tab.id] === 'undefined') {
			resetTabData(sender.tab.id, sender.tab.url);
		} else {
			if ((request.iframe != '1' && ((ITEMS[sender.tab.id]['url'] != sender.tab.url && (sender.tab.url.indexOf("#") != -1 || ITEMS[sender.tab.id]['url'].indexOf("#") != -1) && removeHash(sender.tab.url) != removeHash(ITEMS[sender.tab.id]['url'])) || (sender.tab.url.indexOf("#") == -1 && ITEMS[sender.tab.id]['url'].indexOf("#") == -1 && sender.tab.url != ITEMS[sender.tab.id]['url']) || changed) || sender.tab.url.indexOf('https://chrome.google.com/webstore') != -1)) {
				resetTabData(sender.tab.id, sender.tab.url);
			}
		}
	} else if (request.reqtype == 'get-list') {
		if (typeof ITEMS[request.tid] === 'undefined') {
			sendResponse('reload');
			return;
		}
		var sessionlist;
		var enableval = domainCheck(request.url);
		var trustType = trustCheck(extractDomainFromURL(request.url));
		if (trustType == '1') enableval = 3;
		else if (trustType == '2') enableval = 4;
		if (localStorage['mode'] == 'block') sessionlist = sessionWhiteList;
		else if (localStorage['mode'] == 'allow') sessionlist = sessionBlackList;
		sendResponse({status: localStorage['enable'], enable: enableval, mode: localStorage['mode'], annoyancesmode: localStorage['annoyancesmode'], antisocial: localStorage['antisocial'], annoyances: localStorage['annoyances'], closepage: localStorage['classicoptions'], rating: localStorage['rating'], temp: sessionlist, blockeditems: ITEMS[request.tid]['blocked'], alloweditems: ITEMS[request.tid]['allowed'], domainsort: localStorage['domainsort']});
		changed = true;
	} else if (request.reqtype == 'update-blocked') {
		if (request.src) {
			if (typeof ITEMS[sender.tab.id]['blocked'] === 'undefined') ITEMS[sender.tab.id]['blocked'] = [];
			if (!UrlInList(removeParams(request.src), ITEMS[sender.tab.id]['blocked'])) {
				var extractedDomain = extractDomainFromURL(request.src);
				if (extractedDomain.substr(0,4) == 'www.') extractedDomain = extractedDomain.substr(4);
				var extractedTabDomain = extractDomainFromURL(ITEMS[sender.tab.id]['url']);
				ITEMS[sender.tab.id]['blocked'].push([removeParams(request.src), request.node, extractedDomain, domainCheck(request.src, 1), domainCheck(extractedTabDomain, 1), baddies(request.src, localStorage['annoyancesmode'], localStorage['antisocial'], 2)]);
				updateCount(sender.tab.id);
			}
		}
	} else if (request.reqtype == 'update-allowed') {
		if (request.src) {
			if (typeof ITEMS[sender.tab.id]['allowed'] === 'undefined') ITEMS[sender.tab.id]['allowed'] = [];
			if (!UrlInList(removeParams(request.src), ITEMS[sender.tab.id]['allowed'])) {
				var extractedDomain = extractDomainFromURL(request.src);
				if (extractedDomain.substr(0,4) == 'www.') extractedDomain = extractedDomain.substr(4);
				ITEMS[sender.tab.id]['allowed'].push([removeParams(request.src), request.node, extractedDomain, domainCheck(request.src, 1), baddies(request.src, localStorage['annoyancesmode'], localStorage['antisocial'], 2)]);
			}
		}
	} else if (request.reqtype == 'save') {
		domainHandler(request.url, request.list);
		freshSync(2);
		changed = true;
	} else if (request.reqtype == 'temp') {
		tempHandler(request);
	} else if (request.reqtype == 'remove-temp') {
		removeTempHandler(request);
	} else if (request.reqtype == 'refresh-page-icon') {
		if (request.type == '0') chrome.browserAction.setIcon({path: "../img/IconAllowed.png", tabId: request.tid});
		else if (request.type == '1') chrome.browserAction.setIcon({path: "../img/IconForbidden.png", tabId: request.tid});
		else if (request.type == '2') chrome.browserAction.setIcon({path: "../img/IconTemp.png", tabId: request.tid});
	} else
		sendResponse({});
});
chrome.runtime.onUpdateAvailable.addListener(function (details) {
	if (localStorage["updatemessagenotify"] == "true") chrome.notifications.create('updatenotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - Update Ready', 'message': 'A new version ('+details.version+') of ScriptSafe is available! ScriptSafe will auto-update once you restart your browser.'}, function(callback) { return true; }); 
});
chrome.commands.onCommand.addListener(function (command) {
    if (command === "temppage") {
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
    } else if (command === "removetemppage") {
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
    } else if (command === "removetempall") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			revokeTemp();
			if (localStorage['refresh'] == 'true') chrome.tabs.reload(tabs[0].id);
		});
    }
});
// Debug Synced Items
/*
chrome.storage.sync.get(null, function(changes) {
	for (key in changes) {
		alert(changes['whiteList'].length);
	}
});
*/
function freshSync(mode, force) {
	if (storageapi && localStorage['syncenable'] == 'true') {
		window.clearTimeout(synctimer);
		var settingssync = {};
		var simplesettings = '';
		if (force) {
		// mode == 0 = all; 1 = settings only; 2 = whitelist/blacklist
		//if (mode == 0 || mode == 1) {
			for (var k in localStorage) {
				if (k != "version" && k != "sync" && k != "scriptsafe_settings" && k != "lastSync" && k != "whiteList" && k != "blackList" && k != "whiteListCount" && k != "blackListCount" && k.substr(0, 10) != "whiteList_" && k.substr(0, 10) != "blackList_" && k.substr(0, 2) != "zb" && k.substr(0, 2) != "zw") {
					simplesettings += k+"|"+localStorage[k]+"~";
				}
			}
			simplesettings = simplesettings.slice(0,-1);
			settingssync['scriptsafe_settings'] = simplesettings;
		//}
		//if (mode == 0 || mode == 2) {
			var jsonstr = JSON.parse(localStorage['whiteList']).toString();
			var jsonstrlen = jsonstr.length;
			var limit = (chrome.storage.sync.QUOTA_BYTES_PER_ITEM - Math.ceil(jsonstrlen/(chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 4)) - 4);
			var i = 0;
			while (jsonstr.length > 0) {
				var segment = jsonstr.substr(0, limit);
				settingssync["zw" + i] = segment;
				localStorage["zw" + i] = segment;
				jsonstr = jsonstr.substr(limit);
				i++;
			}
			localStorage['whiteListCount'] = i;
			settingssync['whiteListCount'] = i;
			jsonstr = JSON.parse(localStorage['blackList']).toString();
			jsonstrlen = jsonstr.length;
			limit = (chrome.storage.sync.QUOTA_BYTES_PER_ITEM - Math.ceil(jsonstrlen/(chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 4)) - 4);
			i = 0;
			while (jsonstr.length > 0) {
				var segment = jsonstr.substr(0, limit);
				settingssync["zb" + i] = segment;
				localStorage["zb" + i] = segment;
				jsonstr = jsonstr.substr(limit);
				i++;
			}
			localStorage['blackListCount'] = i;
			settingssync['blackListCount'] = i;
		//}
			var milliseconds = (new Date).getTime();
			localStorage['lastSync'] = milliseconds;
			settingssync['lastSync'] = milliseconds;
			chrome.storage.sync.set(settingssync, function() {
				if (chrome.extension.lastError){
					alert(chrome.extension.lastError.message);
				} else {
					if (localStorage['syncnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - Settings Synced!', 'message': 'Your settings have been successfully synced!'}, function(callback) { return true; } );
				}
			});
		} else {
			synctimer = window.setTimeout(function() { syncQueue() }, 30000);
		}
		return true;
	} else {
		return false;
	}
}
function syncQueue() {
	freshSync(0, true);
}
function importSyncHandle(mode) {
	if (storageapi) {
		if (mode == '1' || (localStorage['sync'] == 'false' && mode == '0')) {
			chrome.storage.sync.get(null, function(changes) {
				if (typeof changes['lastSync'] !== 'undefined' && typeof changes['scriptsafe_settings'] !== 'undefined' && (typeof changes['zw0'] !== 'undefined' || typeof changes['zb0'] !== 'undefined')) {
					if (changes['zw0'] != '' && changes['zw0'] != '*.googlevideo.com') { // ensure synced whitelist is not empty and not the default
						if (confirm("ScriptSafe has detected that you have settings synced on your Google account!\r\nClick on 'OK' if you want to import the settings from your Google Account.")) {
							localStorage['syncenable'] = 'true';
							localStorage['sync'] = 'true';
							importSync(changes, 2);
							if (localStorage['syncfromnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - Settings Downloaded!', 'message': 'The latest settings have been successfully downloaded!'}, function(callback) { return true; });
							return true;
						} else {
							localStorage['syncenable'] = 'false';
							alert('Syncing has been disabled to prevent overwriting your already synced data.\r\nFeel free to go to the Options page at any time to sync your settings (make a backup of your settings if necessary).');
							localStorage['sync'] = 'true'; // set to true so user isn't prompted with this message every time they start Chrome; localStorage['sync'] == true does not mean syncing is enabled, it's more like an acknowledgement flag
							return false;
						}
					}
				} else {
					if (confirm("It appears you haven't synced your settings to your Google account yet.\r\nScriptSafe is about to sync your current settings to your Google account.\r\nClick on 'OK' if you want to continue.\r\nIf not, click 'Cancel', and on the other device with your preferred settings, update ScriptSafe and click on OK when you are presented with this message.")) {
						localStorage['syncenable'] = 'true';
						localStorage['sync'] = 'true';
						freshSync(0, true);
						return true;
					} else {
						localStorage['syncenable'] = 'false';
						alert('Syncing is disabled.\r\nFeel free to go to the Options page at any time to sync your settings (make a backup of your settings if necessary).');
						localStorage['sync'] = 'true'; // set to true so user isn't prompted with this message every time they start Chrome; localStorage['sync'] == true does not mean syncing is enabled, it's more like an acknowledgement flag
						return false;
					}
				}
			});
		}
	} else {
		alert('Your current version of Google Chrome does not support settings syncing. Please try updating your Chrome version and try again.');
		return false;
	}
}
function importSync(changes, mode) {
	for (var key in changes) {
		if (key != 'scriptsafe_settings') {
			if (mode == '1') localStorage[key] = changes[key].newValue;
			else if (mode == '2') localStorage[key] = changes[key];
		} else if (key == 'scriptsafe_settings') {
			if (mode == '1') var settings = changes[key].newValue.split("~");
			else if (mode == '2') var settings = changes[key].split("~");
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
	listsSync(mode);
}
function listsSync(mode) {
	if (mode == '1' || mode == '2') {
		var concatlist = '';
		for (var i = 0; i < localStorage['whiteListCount']; i++) {
			concatlist += localStorage['zw'+i];
		}
		var concatlistarr = concatlist.split(",");
		if (concatlist == '' || concatlistarr.length == 0) localStorage['whiteList'] = JSON.stringify([]);
		else localStorage['whiteList'] = JSON.stringify(concatlistarr);
		concatlist = '';
		for (var i = 0; i < localStorage['blackListCount']; i++) {
			concatlist += localStorage['zb'+i];
		}
		concatlistarr = concatlist.split(",");
		if (concatlist == '' || concatlistarr.length == 0) localStorage['blackList'] = JSON.stringify([]);
		else localStorage['blackList'] = JSON.stringify(concatlistarr);
		cacheLists();
	}
}
//////////////////////////////////////////////////////
function init() {
	setDefaultOptions();
	initWebRTC();
	cacheLists();
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
	}
	localStorage["version"] = version;
	if (localStorage["updatenotify"] == "true") {
		chrome.tabs.create({ url: chrome.extension.getURL('html/updated.html'), selected: true });
	}
}
if (storageapi) {
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		if (namespace == 'sync' && localStorage['syncenable'] == 'true') {
			if (typeof changes['lastSync'] !== 'undefined') {
				if (changes['lastSync'].newValue != localStorage['lastSync']) {
					importSync(changes, 1);
					if (localStorage['syncfromnotify'] == 'true') chrome.notifications.create('syncnotify', {'type': 'basic', 'iconUrl': '../img/icon48.png', 'title': 'ScriptSafe - Settings Downloaded!', 'message': 'The latest settings have been successfully downloaded!'}, function(callback) { return true; });
				}
			}
		}
	});
	importSyncHandle(0);
}
init();