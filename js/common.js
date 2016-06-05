// (c) Andrew Y.
'use strict';
function baddies(src, amode, antisocial, lookupmode) {
	lookupmode = lookupmode || 1;
	var dmn = extractDomainFromURL(src);
	var topDomain = getDomain(dmn);
	if (dmn.indexOf(".") == -1 && src.indexOf(".") != -1) dmn = src;
	if (antisocial == 'true' && (antisocial2.indexOf(dmn) != -1 || antisocial1.indexOf(topDomain) != -1 || src.indexOf("digg.com/tools/diggthis.js") != -1 || src.indexOf("/googleapis.client__plusone.js") != -1 || src.indexOf("apis.google.com/js/plusone.js") != -1 || src.indexOf(".facebook.com/connect") != -1 || src.indexOf(".facebook.com/plugins") != -1 || src.indexOf(".facebook.com/widgets") != -1 || src.indexOf(".fbcdn.net/connect.php/js") != -1 || src.indexOf(".stumbleupon.com/hostedbadge") != -1 || src.indexOf(".youtube.com/subscribe_widget") != -1 || src.indexOf(".ytimg.com/yt/jsbin/www-subscribe-widget") != -1 || src.indexOf("apis.google.com/js/platform.js") != -1 || src.indexOf("plus.google.com/js/client:plusone.js") != -1 || src.indexOf("linkedin.com/countserv/count/share") != -1))
		return '2';
	if ((amode == 'relaxed' && domainCheck(dmn, lookupmode) != '0') || amode == 'strict') {
		if (new BS(yoyo1).search(topDomain)) return '1';
		if (new BS(yoyo2).search(dmn)) return '1';
	}
	return false;
}
function elementStatus(src, mode, taburl) {
	if (taburl === undefined) taburl = window.location.hostname;
	else taburl = extractDomainFromURL(taburl);
	var domainCheckStatus = domainCheck(src);
	if (src.substr(0,11) != 'javascript:' && taburl != 'newtab' && domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && mode == 'block'))) return true;
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
		if (url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || documentHost.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || url.match(/^(?:\[(?:[A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}\])(:[0-9]+)?$/g) || documentHost.match(/^(?:\[(?:[A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}\])(:[0-9]+)?$/g)) return true;
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
	if (url.indexOf("://") != -1) url = url.substr(url.indexOf("://") + 3);
	if (url.indexOf("/") != -1) url = url.substr(0, url.indexOf("/"));
	if (url.indexOf("@") != -1) url = url.substr(url.indexOf("@") + 1);
	if (url.match(/^(?:\[(?:[A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}\])(:[0-9]+)?$/g)) {
		if (url.indexOf("]:") != -1) return url.substr(0, url.indexOf("]:")+1);
		return url;
	}
	if (url.indexOf(":") > 0) url = url.substr(0, url.indexOf(":"));
	return url;
}
function getDomain(url, type) {
	if (url && !url.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && !url.match(/^(?:\[(?:[A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}\])(:[0-9]+)?$/g) && url.indexOf(".") != -1) {
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
	for (var i in haystack) {
		if (new RegExp('(?:www\\.|^)(?:'+haystack[i].replace(/\./g, '\\.').replace(/^\[/, '\\[').replace(/\]$/, '\\]').replace(/\?/g, '.').replace(/^\*\*\\./, '(?:.+\\.|^)').replace(/\*/g, '[^.]+')+')').test(needle)) {
			return '1';
			break;
		}
	}
	return false;
}
// Js-BinarySearch by amgadfahmi
// https://amgadfahmi.github.io/js-binarysearch/
var BS = function(array) {
    if (array) {
        this.internalArray = array;
    } else {
        throw new error('Object is not defined');
    }
    return this;
};

BS.prototype.search = function(target, key) {
    //if (key && typeof key === 'string') {
    //    return this.searchObj(target, key);
    //} else if (typeof target === 'number') {
    //    return this.searchNum(target);
    //} else if (typeof target === 'string') {
        return this.searchStr(target);
    //}
};

/*
BS.prototype.searchNum = function(target) {
    var min = 0,
        max = this.internalArray.length - 1,
        mid;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        if (this.internalArray[mid] === target) {
            return this.internalArray[mid];
        } else if (this.internalArray[mid] < target) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
};

BS.prototype.searchObj = function(target, key) {
    var min = 0,
        max = this.internalArray.length - 1,
        temp, mid;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        temp = this.internalArray[mid] ? this.internalArray[mid][key] : undefined;
        if (temp === target) {
            return this.internalArray[mid];
        } else if (temp < target) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
};
*/

BS.prototype.searchStr = function(target) {
    var min = 0,
        max = this.internalArray.length - 1,
        mid;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        if (this.internalArray[mid] === target) {
            return this.internalArray[mid];
        } else if (this.internalArray[mid] < target) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
};

BS.prototype.sort = function(key) {
    if (this.internalArray.length <= 1) {
        return;
    }
    var isObject = key && typeof key === 'string';
    var isNumber = typeof this.internalArray[0] === 'number';
    if (isObject) {
        this.sortObj(key);
        return this;
    } else if (isNumber) {
        this.sortNum();
        return this;
    } else {
        this.internalArray.sort();
        return this;
    }
};

BS.prototype.sortObj = function(key) {
    var isString = typeof this.internalArray[0][key] === 'string';
    if (isString) {
        this.internalArray.sort(function(a, b) {
            return a[key].localeCompare(b[key]);
        });
    } else {
        this.internalArray.sort(function(a, b) {
            return a[key] - b[key];
        });
    }
};

BS.prototype.sortNum = function() {
    this.internalArray.sort(function(a, b) {
        return a - b;
    });
};