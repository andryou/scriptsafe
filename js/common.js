// (c) Andrew Y. <andryou@gmail.com>
function baddies(src, amode, antisocial) {
	// Confucius say: you go to JAIL, BAD BOY!
	src = src.toLowerCase();
	dmn = extractDomainFromURL(relativeToAbsoluteUrl(src));
	if (dmn.indexOf(".") == -1 && src.indexOf(".") != -1) dmn = src;
	if (antisocial == 'true' && (antisocial2.indexOf(dmn) != -1 || antisocial1.indexOf(getDomain(dmn)) != -1 || src.indexOf("digg.com/tools/diggthis.js") != -1 || src.indexOf("/googleapis.client__plusone.js") != -1 || src.indexOf("apis.google.com/js/plusone.js") != -1 || src.indexOf(".facebook.com/connect") != -1 || src.indexOf(".facebook.com/plugins") != -1 || src.indexOf(".facebook.com/widgets") != -1 || src.indexOf(".fbcdn.net/connect.php/js") != -1 || src.indexOf(".stumbleupon.com/hostedbadge") != -1 || src.indexOf(".youtube.com/subscribe_widget") != -1 || src.indexOf(".ytimg.com/yt/jsbin/www-subscribe-widget") != -1))
		return '2';
	if (((amode == 'relaxed' && domainCheck(dmn, 1) != '0') || amode == 'strict') && (yoyo2.indexOf(dmn) != -1 || yoyo1.indexOf(getDomain(dmn)) != -1))
		return '1';
	return false;
}
function elementStatus(src, mode, taburl) {
	src = relativeToAbsoluteUrl(src).toLowerCase();
	if (taburl === undefined) taburl = window.location.hostname.toLowerCase();
	else taburl = extractDomainFromURL(taburl.toLowerCase());
	if (src.substr(0,11) != 'javascript:' && domainCheck(src) != '0' && (domainCheck(src) == '1' || (domainCheck(src) == '-1' && mode == 'block' && (thirdParty(src, taburl) || !thirdParty(src, taburl) || (thirdParty(src, taburl) && src.indexOf("?") != -1 && (src.indexOf(taburl) != -1 || (taburl.substr(0,4)=='www.' && src.indexOf(taburl.substr(4)) != -1) || src.indexOf(extractDomainFromURL(src), extractDomainFromURL(src).length) != -1 || (extractDomainFromURL(src).substr(0,4)=='www.' && src.indexOf(extractDomainFromURL(src).substr(4), extractDomainFromURL(src).length) != -1) || src.indexOf(getDomain(taburl, 1)) != -1)))))) return true;
	return false;
}
function thirdParty(url, taburl) {
	if (url) {
		var requestHost = relativeToAbsoluteUrl(url.toLowerCase());
		if (domainCheck(requestHost) == '0') return false;
		var requestHost = extractDomainFromURL(requestHost);
		if (taburl === undefined) documentHost = window.location.hostname.toLowerCase();
		else documentHost = taburl;
		requestHost = requestHost.replace(/\.+$/, "");
		documentHost = documentHost.replace(/\.+$/, "");
		if (requestHost == documentHost) return false; // if they match exactly (same domain), our job here is done
		// handle IP addresses (if we're still here, then it means the ip addresses don't match)
		if (requestHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || documentHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) return true;
		// now that IP addresses have been processed, carry on.
		elConst = requestHost.split('.').reverse(); // work backwards :)
		pageConst = documentHost.split('.').reverse();
		max = elConst.length;
		if (max < pageConst.length)
			max = pageConst.length;
		matchCount = 0;
		for (i=0;i<max;i++) {
			if (elConst[i] && pageConst[i] && elConst[i] == pageConst[i]) matchCount++;
			else break; // exit loop as soon as something doesn't exist/match
		}
		if (matchCount > 2) return false;
		else if (matchCount == 2 && ((pageConst[1] == 'co' || pageConst[1] == 'com' || pageConst[1] == 'net') && pageConst[0] != 'com')) return true;
		if (matchCount == 2) return false;
		return true;
	} else return false; // doesn't have a URL
}
function relativeToAbsoluteUrl(url) { // credit: NotScripts
	if (!url || url.match(/^http/i))
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
function extractDomainFromURL(url) { // credit: NotScripts
	if (!url) return "";
	var x = url.toLowerCase();
	if (x.indexOf("://") != -1) x = x.substr(url.indexOf("://") + 3);
	if (x.indexOf("/") != -1) x = x.substr(0, x.indexOf("/"));
	if (x.indexOf("@") != -1) x = x.substr(x.indexOf("@") + 1);
	if (x.indexOf(":") > 0) x = x.substr(0, x.indexOf(":"));
	return x;
}
function getDomain(url, type) {
	if (url && !url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && url.indexOf(".") != -1) {
		// below line may be edited/removed in the future to support granular trust-ing
		if (url[0] == '*' && url[1] == '.') return url.substr(2);
		url = url.toLowerCase().split(".").reverse();
		len = url.length;
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
function in_array(needle, haystack) { // credit: NotScripts
	for (key in haystack) {
		if (haystack[key]==needle) {
			return '1';
			break;
		} else if (haystack[key][0] == '*' && haystack[key][1] == '.' && needle.indexOf(haystack[key].substr(2)) != -1 && getDomain(needle) == getDomain(haystack[key])) {
			return '2';
			break;
		}
	}
	return false;
}