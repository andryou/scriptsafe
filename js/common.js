// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
'use strict';
function baddies(src, amode, antisocial, lookupmode) {
	lookupmode = lookupmode || 1;
	var dmn = extractDomainFromURL(src);
	var topDomain = getDomain(dmn);
	if (dmn.indexOf(".") == -1 && src.indexOf(".") != -1) dmn = src;
	if (antisocial == 'true' && (antisocial2.indexOf(dmn) != -1 || antisocial1.indexOf(topDomain) != -1 || src.indexOf("digg.com/tools/diggthis.js") != -1 || src.indexOf("/googleapis.client__plusone.js") != -1 || src.indexOf("apis.google.com/js/plusone.js") != -1 || src.indexOf(".facebook.com/connect") != -1 || src.indexOf(".facebook.com/plugins") != -1 || src.indexOf(".facebook.com/widgets") != -1 || src.indexOf(".fbcdn.net/connect.php/js") != -1 || src.indexOf(".stumbleupon.com/hostedbadge") != -1 || src.indexOf(".youtube.com/subscribe_widget") != -1 || src.indexOf(".ytimg.com/yt/jsbin/www-subscribe-widget") != -1 || src.indexOf("apis.google.com/js/platform.js") != -1 || src.indexOf("plus.google.com/js/client:plusone.js") != -1 || src.indexOf("linkedin.com/countserv/count/share") != -1))
		return '2';
	if ((amode == 'relaxed' && domainCheck(dmn, lookupmode) != '0') || amode == 'strict') {
		if (binarySearch(yoyo1, topDomain) != -1) return '1';
		if (binarySearch(yoyo2, dmn) != -1) return '1';
	}
	return false;
}
function thirdParty(url, taburl) {
	if (url) {
		var url = extractDomainFromURL(url);
		var documentHost;
		if (taburl === undefined) documentHost = window.location.hostname;
		else documentHost = taburl;
		url = url.replace(/\.+$/, "");
		documentHost = documentHost.replace(/\.+$/, "");
		if (url == documentHost) return false; // if they match exactly (same domain), our job here is done
		// handle IP addresses (if we're still here, then it means the ip addresses don't match)
		if (url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || documentHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || url.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g) || documentHost.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) return true;
		// now that IP addresses have been processed, carry on.
		var elConst = url.split('.').reverse(); // work backwards :)
		var pageConst = documentHost.split('.').reverse();
		var max = elConst.length;
		if (max < pageConst.length)
			max = pageConst.length;
		var matchCount = 0;
		for (var i=0;i<max;i++) {
			if (elConst[i] && pageConst[i] && elConst[i] == pageConst[i]) matchCount++;
			else break; // exit loop as soon as something doesn't exist/match
		}
		if (matchCount > 2) return false;
		else if (matchCount == 2 && ((pageConst[1] == 'co' || pageConst[1] == 'com' || pageConst[1] == 'net') && pageConst[0] != 'com')) return true;
		if (matchCount == 2) return false;
		return true;
	}
	return false; // doesn't have a URL
}
function extractDomainFromURL(url) { // credit: NotScripts
	if (!url) return "";
	if (url.indexOf("://") != -1) url = url.substr(url.indexOf("://") + 3);
	if (url.indexOf("/") != -1) url = url.substr(0, url.indexOf("/"));
	if (url.indexOf("@") != -1) url = url.substr(url.indexOf("@") + 1);
	if (url.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) {
		if (url.indexOf("]:") != -1) return url.substr(0, url.indexOf("]:")+1);
		return url;
	}
	if (url.indexOf(":") > 0) url = url.substr(0, url.indexOf(":"));
	return url;
}
function getDomain(url, type) {
	if (url && !url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && !url.match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g) && url.indexOf(".") != -1) {
		if (url[0] == '*' && url[1] == '*' && url[2] == '.') return url.substr(3);
		url = url.split(".").reverse();
		var domain;
		var len = url.length;
		if (len > 1) {
			if (type === undefined) domain = url[1]+'.'+url[0];
			else domain = url[1];
			if ((url[1] == 'co' || url[1] == 'com' || url[1] == 'net') && url[0] != 'com' && len > 2) {
				if (type === undefined) domain = url[2]+'.'+url[1]+'.'+url[0];
				else domain = url[2];
			}
		}
		return domain;
	}
	return url;
}
function in_array(needle, haystack) {
	if (!haystack || !needle) return false;
	if (needle.indexOf('www.') == 0) needle = needle.substring(4);
	if (binarySearch(haystack, needle) != -1) return '1';
	for (var i in haystack) {
		if (haystack[i].indexOf("*") == -1 && haystack[i].indexOf("?") == -1) continue;
		if (new RegExp('^(?:'+haystack[i].replace(/\./g, '\\.').replace(/^\[/, '\\[').replace(/\]$/, '\\]').replace(/\?/g, '.').replace(/^\*\*\\./, '(?:.+\\.|^)').replace(/\*/g, '[^.]+')+')$').test(needle)) return '1';
	}
	return false;
}
// https://github.com/Olical/binary-search/blob/master/src/binarySearch.js
function binarySearch(list, item) {
    var min = 0;
    var max = list.length - 1;
    var guess;
	var bitwise = (max <= 2147483647) ? true : false;
	if (bitwise) {
		while (min <= max) {
			guess = (min + max) >> 1;
			if (list[guess] === item) { return guess; }
			else {
				if (list[guess] < item) { min = guess + 1; }
				else { max = guess - 1; }
			}
		}
	} else {
		while (min <= max) {
			guess = Math.floor((min + max) / 2);
			if (list[guess] === item) { return guess; }
			else {
				if (list[guess] < item) { min = guess + 1; }
				else { max = guess - 1; }
			}
		}
	}
    return -1;
}