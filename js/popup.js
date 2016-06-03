var version = (function () {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
	xhr.send(null);
	return JSON.parse(xhr.responseText).version;
}());
var port = chrome.extension.connect({name: "popuplifeline"});
var bkg = chrome.extension.getBackgroundPage();
var closepage, mode, taburl, tabid, tabdomain;
var selected = false;
var intemp = false;
var undesirablecount = 0;
var blocked = [];
var allowed = [];
var statuschange = function() {
	port.postMessage({url: taburl, tid: tabid});
	bkg.statuschanger();
	window.close();
};
var revokealltemp = function() {
	port.postMessage({url: taburl, tid: tabid});
	bkg.revokeTemp();
	window.close();
};
var bulkhandle = function() {
	port.postMessage({url: taburl, tid: tabid});
	bulk($(this));
};
var removehandle = function() {
	remove(tabdomain, $(this), '0');
};
var x_removehandle = function() {
	remove($(this).parent().attr("rel"), $(this), '1');
};
var savehandle = function() {
	port.postMessage({url: taburl, tid: tabid});
	save(tabdomain, $(this), '0');
};
var x_savehandle = function() {
	port.postMessage({url: taburl, tid: tabid});
	save($(this).parent().attr("rel"), $(this), '1');
};
function openTab(url) {
	chrome.tabs.create({url: url});
	window.close();
}
function truncate(str, len) {
	if (str.length > len)
		return str.substring(0, len)+'...';
	return str;
}
document.addEventListener('DOMContentLoaded', function () {
	setTimeout(init, 25);
	$("#pop_ay").click(function() { openTab('https://twitter.com/andryou'); });
	$("#pop_docs").click(function() { openTab('https://github.com/andryou/scriptsafe/wiki'); });
	$("#pop_project").click(function() { openTab('https://github.com/andryou/scriptsafe'); });
	$("#pop_options").click(function() { openTab(chrome.extension.getURL('html/options.html')); });
	$("#pop_webstore").click(function() { openTab('https://chrome.google.com/webstore/detail/scriptsafe/oiigbmnaadbkfbmpbfijlflahbdbdgdf'); });
	$("#pop_close").click(function() { window.close(); });
});
function init() {
	$("#version").html(version);
	chrome.windows.getCurrent(function(w) {
		chrome.tabs.getSelected(w.id, function(tab) {
			taburl = tab.url;
			tabdomain = bkg.extractDomainFromURL(taburl);
			if (tabdomain.substr(0,4) == 'www.') tabdomain = tabdomain.substr(4);
			tabid = tab.id;
			if (taburl.substr(0, 4) != 'http' || tabdomain == 'chrome.google.com') {
				$("#currentdomain").html("Not filtered");
				$(".thirds").html('<i>This tab has loaded no external resources</i>');
			} else {
				chrome.extension.sendRequest({reqtype: "get-list", url: taburl, tid: tabid}, function(response) {
					if (response == 'reload') {
						alert('ScriptSafe was recently updated/reloaded. You will need to either refresh this tab, create a new tab, or restart your browser in order for ScriptSafe to work.');
						window.close();
						return;
					}
					mode = response.mode;
					var responseBlockedCount = response.blockeditems.length;
					var responseAllowedCount = response.alloweditems.length;
					var tabInTemp = bkg.in_array(tabdomain, response.temp);
					$("#currentdomain").html('<span title="'+tabdomain+'">'+tabdomain+'</span>');
					if ((responseBlockedCount == 0 && responseAllowedCount == 0) || response.status == 'false') {
						if (response.status == 'false') {
							$(".thirds").html('<i>ScriptSafe is disabled</i>');
							$("#parent").append('<div class="box box1 snstatus" title="Enable ScriptSafe">Enable ScriptSafe</div>');
							$(".snstatus").bind("click", statuschange);
							return false;
						}
						$(".thirds").html('<i>This tab has loaded no external resources</i>');
					} else {
						if (responseBlockedCount != 0) {
							if (response.domainsort == 'true') response.blockeditems = bkg.domainSort(response.blockeditems);
							else response.blockeditems.sort();
							$(".thirds").parent().after("<tr><td class='bolded' style='padding-top: 5px;'><span class='blocked'>Blocked Resources</span></td><td id='parent'></td></tr><tr><td class='thirds' id='blocked'></td><td></td></tr>");
							$(".thirds:first").parent().remove();
							$("#parent").attr("rowspan","2");
							for (var i=0;i<responseBlockedCount;i++) {
								var itemdomain = response.blockeditems[i][2];
								if (response.blockeditems[i][1] == 'NOSCRIPT') itemdomain = 'no.script';
								else if (response.blockeditems[i][1] == 'WEBBUG') itemdomain = 'web.bug';
								if (itemdomain) {
									var baddiesstatus = response.blockeditems[i][5];
									var parentstatus = response.blockeditems[i][4];
									var itemdomainanchor = itemdomain + baddiesstatus;
									var domainCheckStatus = response.blockeditems[i][3];
									var itemdomainfriendly = itemdomain.replace(/\./g,"_");
									blocked.push(itemdomain);
									if ($('#blocked .thirditem[rel="x_'+itemdomainanchor+'"]').length == 0) {
										if (domainCheckStatus == '1') {
											var trustval0 = '';
											var trustval1 = '';
											var allowedtype;
											var trustType = bkg.trustCheck(itemdomain);
											if (trustType == '1') {
												trustval0 = ' selected';
												allowedtype = 3;
											} else if (trustType == '2') {
												trustval1 = ' selected';
												allowedtype = 4;
											} else allowedtype = 1;
											$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">Clear</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist selected" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
										} else {
											if (response.blockeditems[i][1] == 'NOSCRIPT' || response.blockeditems[i][1] == 'WEBBUG') {
												$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>&lt;'+response.blockeditems[i][1]+'&gt;</span> (<span rel="count_'+itemdomain+'">1</span>)</span></div>');
											} else {
												$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">Clear</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
												$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).hide();
											}
										}
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).bind("click", x_removehandle);
									} else {
										$("#blocked [rel='x_"+itemdomainanchor+"']").attr("title",$("#blocked [rel='x_"+itemdomainanchor+"']").attr("title")+"\r\n["+response.blockeditems[i][1]+"] "+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&")));
										$("#blocked [rel='count_"+itemdomain+"']").html((parseInt($("#blocked [rel='count_"+itemdomain+"']").html())+1));
									}
									if (response.rating == 'true') $("[rel='r_"+itemdomain+"']").html('<span class="wot"><span class="box box4" title="See Rating for '+itemdomain+'"><a href="http://www.mywot.com/en/scorecard/'+itemdomain+'" target="_blank">Rating</a></span></span>');
									if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesstatus == 1) || (response.antisocial == 'true' && baddiesstatus == '2')) {
										$("#blocked").append($("#blocked [rel='x_"+itemdomainanchor+"']"));
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box1, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_trust, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box3, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box4").hide();
										if (response.antisocial == 'true' && baddiesstatus == '2') {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Antisocial").html("Antisocial").addClass("selected");
										} else {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
										}
										undesirablecount++;
									} else if (parentstatus == '1' && domainCheckStatus == '0') {
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box1, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_trust, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box3, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box4").hide();
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Ignored whitelisted domain due to blacklisted tab domain").html("Ignored Whitelist").addClass("selected");
									} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesstatus == '1') {
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).hide();
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
									}
									if (mode == 'allow') {
										if (bkg.in_array(itemdomain, response.temp)) {
											if (!intemp) intemp = true;
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").removeClass("selected");
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_bypass").addClass("selected");
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).hide();
										} else {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_bypass").hide();
										}
									}
								}
							}
							$("#blocked").append($('.thirditem:has([title="Unwanted Content Provider"])'));
							$("#blocked").append($('.thirditem:has([title="Antisocial"])'));
							$("#blocked").append($('.thirditem:not(*>:has(.choices))'));
							$("#blocked").append($("#blocked [rel='x_web.bug']"));
							$("#blocked").append($("#blocked [rel='x_no.script']"));
							$("#blocked [rel='x_"+tabdomain+"']").children().first().css("font-weight", "bold");
							$("#blocked").prepend($("#blocked [rel='x_"+tabdomain+"']"));
						}
						if (responseAllowedCount != 0) {
							if (response.domainsort == 'true') response.alloweditems = bkg.domainSort(response.alloweditems);
							else response.alloweditems.sort();
							$("#parent").attr("rowspan","3");
							$(".thirds").parent().parent().append("<tr><td class='bolded' style='padding-top: 15px;'><span class='allowed'>Allowed Resources</span></td><td class='bolded'></td></tr><tr><td class='thirds' id='allowed'></td><td></td></tr>");
							if (blocked.length != 0) $("#parent").attr("rowspan","4");
							else $("td.bolded").css('padding-top', '0px');
							for (var i=0;i<responseAllowedCount;i++) {
								var itemdomain = response.alloweditems[i][2];
								if (itemdomain) {
									allowed.push(itemdomain);
									var itemdomainfriendly = itemdomain.replace(/\./g,"_");
									if ($('#allowed .choices[rel="'+itemdomain+'"]').length == 0) {
										if (response.alloweditems[i][3] == '0') {
											var trustval0 = '';
											var trustval1 = '';
											var allowedtype;
											var trustType = bkg.trustCheck(itemdomain);
											if (trustType == '1') {
												trustval0 = ' selected';
												allowedtype = 3;
											} else if (trustType == '2') {
												trustval1 = ' selected';
												allowedtype = 4;
											} else allowedtype = 0;
											$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomain+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">Clear</span><span class="box box1 x_whitelist selected" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
											$("#allowed .x_"+itemdomainfriendly).bind("click", x_removehandle);
										} else {
											$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomain+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">Clear</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
											$("#allowed [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).hide();
										}
									} else {
										$("#allowed [rel='x_"+itemdomain+"']").attr("title",$("#allowed [rel='x_"+itemdomain+"']").attr("title")+"\r\n["+response.alloweditems[i][1]+"] "+response.alloweditems[i][0]);
										$("#allowed [rel='count_"+itemdomain+"']").html((parseInt($("#allowed [rel='count_"+itemdomain+"']").html())+1));
									}
									if (response.rating == 'true') $("[rel='r_"+itemdomain+"']").html('<span class="wot"><span class="box box4" title="See Rating for '+itemdomain+'"><a href="http://www.mywot.com/en/scorecard/'+itemdomain+'" target="_blank">Rating</a></span></span>');
									if (mode == 'block') {
										if (bkg.in_array(itemdomain, response.temp)) {
											if (!intemp) intemp = true;
											$("#allowed [rel='"+itemdomain+"'] .x_whitelist").removeClass("selected");
											$("#allowed [rel='"+itemdomain+"'] .x_bypass").addClass("selected");
											$("#allowed [rel='"+itemdomain+"'] .x_"+itemdomainfriendly).hide();
										} else {
											$("#allowed [rel='"+itemdomain+"'] .x_bypass").hide();
										}
									}
								}
							}
							$("#allowed [rel='x_"+tabdomain+"']").children().first().css("font-weight", "bold");
							$("#allowed").prepend($("#allowed [rel='x_"+tabdomain+"']"));
						}
						var blockedCount = blocked.length;
						var allowedCount = allowed.length;
						if (responseBlockedCount != 0 && blockedCount == 0) $(".thirds:first").html('<i>None</i>');
						if (responseAllowedCount != 0 && allowedCount == 0) $(".allowed").parent().hide();
						$(".x_whitelist,.x_blacklist,.x_trust,.x_bypass").bind("click", x_savehandle);
						var tempSel;
						if (responseAllowedCount == 0) tempSel = '.thirds';
						else tempSel = '#allowed';
						if (mode == 'block') {
							if (($('#blocked .thirditem').length == 1 && $('#blocked .thirditem[rel="x_no.script"]').length == 1) || ($('#blocked .thirditem').length == 1 && $('#blocked .thirditem[rel="x_web.bug"]').length == 1)) {
								// empty space
							} else {
								if (blockedCount != 0 && undesirablecount != blockedCount) {
									$(tempSel).append('<br /><div class="box box3 allowsession" title="Allow all blocked resources for the session (not including webbugs/noscript tags/annoyances)">Allow All Blocked For Session</div>');
								} else {
									$(tempSel).append('<br />');
								}
							}
						} else {
							$(tempSel).append('<br /><div class="box box3 allowsession" title="Block all allowed resources for the session">Block All Allowed For Session</div>');
						}
						$(".allowsession").bind("click", bulkhandle);
						if (intemp || tabInTemp) {
							$(tempSel).append('<div class="box box5 prevoke" title="Revoke temporary permissions given to the current page">Revoke Page Temp. Permissions</div>');
							$(".prevoke").bind("click", bulkhandle);
						}
						if (response.temp) {
							$("#parent").append('<hr><div class="box box5 clearglobaltemp" title="Revoke all temporary permissions given in this entire browsing session">Revoke All Temp.</div>');
							$(".clearglobaltemp").bind("click", revokealltemp);
						}
					}
					$("#parent").prepend('<div class="box box1 pallow" rel="0" title="Allow Current Domain">Allow</div><div class="box box1 ptrust" rel="3" title="Trust Entire Domain">Trust</div><div class="box box2 pdeny" rel="1" title="Deny">Deny</div><div class="box box2 ptrust" rel="4" title="Distrust Entire Domain">Distrust</div><div class="box box3 pbypass" rel="2" title="Temp.">Temp.</div><div class="box box4 pclear" title="Clear Domain from List">Clear</div>').attr("sn_list",response.enable);
					$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
					$(".pclear").bind("click", removehandle).hide();
					if (response.enable == '1' || response.enable == '4') {
						if (tabInTemp) {
							$(".pbypass, #blocked [rel='"+tabdomain+"'] .x_bypass").addClass('selected');
							$("#blocked [rel='"+tabdomain+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
							$("#blocked .x_"+tabdomain.replace(/\./g,"_")).hide();
						} else {
							$(".pbypass").hide();
							$(".pclear").show();
							$(".pdeny").addClass("selected");
							if (response.enable == '4') $(".ptrust[rel='4']").addClass("selected");
						}
						var domainCheckStatus = bkg.domainCheck(taburl, 1);
						var baddiesStatus = bkg.baddies(taburl, response.annoyancesmode, response.antisocial);
						if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesStatus == 1) || (response.antisocial == 'true' && baddiesStatus == '2')) {
							if (response.antisocial == 'true' && baddiesStatus == '2') {
								$(".pdeny").addClass("selected").attr("title","Blocked (antisocial)").text("Antisocial");
							} else {
								$(".pdeny").addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
							}
							$(".pbypass, .ptrust[rel='3'], .ptrust[rel='4'], .pclear, .pallow").hide();
						} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesStatus == 1) {
							$(".pdeny").addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
						}
					} else if (response.enable == '0' || response.enable == '3') {
						if (tabInTemp) {
							$(".pbypass, #allowed [rel='"+tabdomain+"'] .x_bypass").addClass('selected');
							$("#allowed [rel='"+tabdomain+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
							$("#allowed .x_"+tabdomain.replace(/\./g,"_")).hide();
						} else {
							$(".pbypass").hide();
							$(".pclear").show();
							$(".pallow").addClass("selected");
							if (response.enable == '3') $(".ptrust[rel='3']").addClass("selected");
						}
					}
					if (response.status == 'true') $("#footer").prepend('<span class="box box2 snstatus" title="Disable ScriptSafe">Disable</span>&nbsp;|&nbsp;');
					$(".snstatus").bind("click", statuschange);
					closepage = response.closepage;
				});
			}
		});
	});
}
function bulk(el) {
	var urlarray;
	if (el.hasClass("prevoke")) {
		if (mode == 'block') urlarray = allowed;
		else urlarray = blocked;
		chrome.extension.sendRequest({reqtype: "remove-temp", url: urlarray});
	} else {
		if (mode == 'block') urlarray = blocked;
		else urlarray = allowed;
		chrome.extension.sendRequest({reqtype: "temp", url: urlarray, mode: mode});
	}
	window.close();
}
function remove(url, el, type) {
	var val = el.attr("rel");
	var selected = el.hasClass("selected");
	if (val != 2 && selected) return;
	port.postMessage({url: taburl, tid: tabid});
	var trustType = bkg.trustCheck(url);
	if (trustType) {
		bkg.domainHandler('**.'+bkg.getDomain(url), 2);
		bkg.domainHandler('**.'+bkg.getDomain(url), 2, 1);
	} else {
		bkg.domainHandler(url, 2);
		bkg.domainHandler(url, 2, 1);
	}
	chrome.extension.sendRequest({reqtype: "refresh-page-icon", tid: tabid, type: 1});
	if (closepage == 'true') window.close();
	else {
		if (el.parent().attr("sn_list") == '0') {
			$("[rel='"+url+"'], #parent").attr("sn_list", "-1");
			$("[rel='"+url+"'] .x_bypass").show();
		}
		el.hide();
		if (type == '0') {
			var urlfriendly = url.replace(/\./g,"_");
			$(".x_"+urlfriendly).parent().children().removeClass("selected");
			$(".x_"+urlfriendly).hide();
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
			if ($("[rel='"+url+"'] .x_blacklist").text() == 'Unwanted') $("[rel='"+url+"'] .x_blacklist").addClass("selected");
			$(".pbypass, [rel='"+url+"'] .x_bypass").show();
		} else if (type == '1') {
			if (url == tabdomain) {
				$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
				$(".pbypass").show();
				$('.pclear').hide();
			}
			$("[rel='"+url+"'] .x_bypass").show();
			el.parent().children().removeClass("selected");
			if ($("[rel='"+url+"'] .x_blacklist").text() == 'Unwanted') $("[rel='"+url+"'] .x_blacklist").addClass("selected");
		}
	}
}
function save(url, el, type) {
	var val = el.attr("rel");
	var selected = el.hasClass("selected");
	if (val != 2 && selected) return;
	if (val < 2) {
		bkg.domainHandler(url, '2', '1');
		chrome.extension.sendRequest({reqtype: "save", url: url, list: val});
	} else if (val == 2) {
		if (selected) chrome.extension.sendRequest({reqtype: "remove-temp", url: url});
		else chrome.extension.sendRequest({reqtype: "temp", url: url, mode: mode});
	} else if (val == 3) {
		bkg.topHandler(url, 0);
		val = 0;
	} else if (val == 4) {
		bkg.topHandler(url, 1);
		val = 1;
	}
	if (url == tabdomain) chrome.extension.sendRequest({reqtype: "refresh-page-icon", tid: tabid, type: val});
	if (closepage == 'true') window.close();
	else {
		if (type == '0') {
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
			$("[rel='"+url+"']").children().removeClass("selected");
			$(".x_"+url.replace(/\./g,"_")).hide();
			if (val == 0) $("[rel='"+url+"'] .x_whitelist").addClass('selected');
			else if (val == 1) $("[rel='"+url+"'] .x_blacklist").addClass('selected');
			else if (val == 2) $("[rel='"+url+"'] .x_bypass").addClass('selected');
			$(".pclear").hide();
			if (el.attr("rel") == '3') {
				$(".pallow, [rel='"+url+"'] .x_trust[rel='3']").addClass('selected');
			} else if (el.attr("rel") == '4') {
				$(".pdeny, [rel='"+url+"'] .x_trust[rel='4']").addClass('selected');
			}
			if (val < 2) {
				$(".pbypass, [rel='"+url+"'] .x_bypass").hide();
				$(".x_"+url.replace(/\./g,"_")+", .pclear").show();
				el.addClass('selected');
			} else {
				if (!selected) {
					el.addClass('selected');
					$("[rel='"+url+"'] .x_bypass").addClass('selected');
				} else {
					$("[rel='"+url+"'] .x_bypass").removeClass('selected');
				}
			}
		} else if (type == '1') {
			el.parent().children().removeClass("selected");
			$(".x_"+url.replace(/\./g,"_")).hide();
			if (url == tabdomain) {
				$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
				$(".pclear").hide();
				if (val == 0) $(".pallow").addClass('selected');
				else if (val == 1) $(".pdeny").addClass('selected');
				if (el.attr("rel") == '3') {
					$(".ptrust[rel='3'], [rel='"+url+"'] .x_whitelist").addClass('selected');
				} else if (el.attr("rel") == '4') {
					$(".ptrust[rel='4'], [rel='"+url+"'] .x_blacklist").addClass('selected');
				}
			}
			if (val < 2) {
				if (url == tabdomain) {
					$(".pclear").show();
					$(".pbypass").hide();
				} else {
					if (el.attr("rel") == '3') $("[rel='"+url+"'] .x_whitelist").addClass('selected');
					else if (el.attr("rel") == '4') $("[rel='"+url+"'] .x_blacklist").addClass('selected');
				}
				el.addClass('selected');
				$(".x_"+url.replace(/\./g,"_")).show();
				$("[rel='"+url+"'] .x_bypass").hide();
			} else {
				if (!selected) {
					el.addClass('selected');
					if (url == tabdomain) $(".pbypass").addClass('selected').show();
				} else {
					if (url == tabdomain) $(".pbypass").removeClass('selected').show();
					if ($("[rel='"+url+"'] .x_blacklist").text() == 'Unwanted') $("[rel='"+url+"'] .x_blacklist").addClass("selected");
				}
				$("[rel='"+url+"'] .x_bypass").show();
			}
		}
	}
	selected = false;
}