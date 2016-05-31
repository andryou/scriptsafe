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
	init();
	$("#pop_quick").click(function() { openTab('https://www.andryou.com/2011/08/21/scriptsafe-a-quick-guide/'); });
	$("#pop_overview").click(function() { openTab('https://www.andryou.com/2011/08/14/scriptsafe/'); });
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
			tabid = tab.id;
			if (taburl.substr(0, 4) != 'http') {
				$("#currentdomain").html("Not filtered");
				$(".thirds").html('<i>This tab has loaded no external resources</i>');
			} else {
				chrome.extension.sendRequest({reqtype: "get-list", url: taburl, tid: tabid}, function(response) {
					mode = response.mode;
					var responseBlockedCount = response.blockeditems.length;
					var responseAllowedCount = response.alloweditems.length;
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
							$(".thirds").parent().after("<tr><td class='bolded' style='padding-top: 5px;'><span class='blocked'>Blocked Resources</span></td><td id='parent'></td></tr><tr><td class='thirds'></td><td></td></tr>");
							$(".thirds:first").parent().remove();
							$("#parent").attr("rowspan","2");
							for (var i=0;i<responseBlockedCount;i++) {
								var itemdomain = response.blockeditems[i][2];
								if (response.blockeditems[i][1] == 'NOSCRIPT') itemdomain = 'no.script';
								else if (response.blockeditems[i][1] == 'WEBBUG') itemdomain = 'web.bug';
								if (itemdomain) {
									var baddiesstatus = response.blockeditems[i][4];
									var itemdomainanchor = itemdomain + baddiesstatus;
									var domainCheckStatus = response.blockeditems[i][3];
									blocked.push(itemdomain);
									if ($('.thirds .thirditem[rel="x_'+itemdomainanchor+'"]').length == 0) {
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
											$(".thirds").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist selected" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
											if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesstatus == 1) || (response.antisocial == 'true' && baddiesstatus == '2')) {
												// empty
											} else {
												if (mode == 'allow') {
													$("[rel='"+itemdomainanchor+"'] [rel='"+itemdomain+"']").prepend('<span class="box box4 x_'+itemdomain.replace(/\./g,"_")+'" title="Clear">Clear</span>');
													$("[rel='"+itemdomainanchor+"'] .x_"+itemdomain.replace(/\./g,"_")).bind("click", x_removehandle);
												}
											}
										} else {
											if (response.blockeditems[i][1] == 'NOSCRIPT' || response.blockeditems[i][1] == 'WEBBUG') {
												$(".thirds").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>&lt;'+response.blockeditems[i][1]+'&gt;</span> (<span rel="count_'+itemdomain+'">1</span>)</span></div>');
											} else {
												$(".thirds").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
											}
										}
									} else {
										$(".thirds [rel='x_"+itemdomainanchor+"']").attr("title",$(".thirds [rel='x_"+itemdomainanchor+"']").attr("title")+"\r\n["+response.blockeditems[i][1]+"] "+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&")));
										$(".thirds [rel='count_"+itemdomain+"']").html((parseInt($(".thirds [rel='count_"+itemdomain+"']").html())+1));
									}
									if (response.rating == 'true') $("[rel='r_"+itemdomain+"']").html('<span class="wot"><span class="box box4" title="See Rating for '+itemdomain+'"><a href="http://www.mywot.com/en/scorecard/'+itemdomain+'" target="_blank">Rating</a></span></span>');
									if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesstatus == 1) || (response.antisocial == 'true' && baddiesstatus == '2')) {
										$(".thirds").append($(".thirds [rel='x_"+itemdomainanchor+"']"));
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box1, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_trust, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box3").remove();
										if (response.antisocial == 'true' && baddiesstatus == '2') {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Antisocial").html("Antisocial").addClass("selected");
										} else {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
										}
										undesirablecount++;
									} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesstatus == '1') {
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomain.replace(/\./g,"_")).remove();
										$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
									}
								}
								if (mode == 'allow') {
									if (bkg.in_array(itemdomain, response.temp)) {
										$("[rel='"+itemdomain+"'] .x_blacklist").removeClass("selected");
										$("[rel='"+itemdomain+"'] .x_bypass").addClass("selected");
									} else {
										$("[rel='"+itemdomain+"'] .x_bypass").remove();
									}
								}
								$(".thirds").append($('.thirditem:has([title="Unwanted Content Provider"])'));
								$(".thirds").append($('.thirditem:has([title="Antisocial"])'));
								$(".thirds").append($('.thirditem:not(*>:has(.choices))'));
								$(".thirds").append($(".thirds [rel='x_web.bug']"));
								$(".thirds").append($(".thirds [rel='x_no.script']"));
								$(".thirds [rel='x_"+tabdomain+"']").children().first().css("font-weight", "bold");
								$(".thirds").prepend($(".thirds [rel='x_"+tabdomain+"']"));
								if (tabdomain.substr(0,4) == 'www.') {
									$(".thirds [rel='x_"+tabdomain.substr(4)+"']").children().first().css("font-weight", "bold");
									$(".thirds").prepend($(".thirds [rel='x_"+tabdomain.substr(4)+"']"));
								} else {
									$(".thirds [rel='x_www."+tabdomain+"']").children().first().css("font-weight", "bold");
									$(".thirds").prepend($(".thirds [rel='x_www."+tabdomain+"']"));
								}
							}
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
											$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomain+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box1 x_whitelist selected" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
											if (mode == 'block') {
												var itemdomainfriendly = itemdomain.replace(/\./g,"_");
												$("#allowed [rel='"+itemdomain+"']").prepend('<span class="box box4 x_'+itemdomainfriendly+'" title="Clear">Clear</span>');
												$("#allowed .x_"+itemdomainfriendly).bind("click", x_removehandle);
											}
										} else {
											$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomain+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
										}
									} else {
										$("#allowed [rel='x_"+itemdomain+"']").attr("title",$("#allowed [rel='x_"+itemdomain+"']").attr("title")+"\r\n["+response.alloweditems[i][1]+"] "+response.alloweditems[i][0]);
										$("#allowed [rel='count_"+itemdomain+"']").html((parseInt($("#allowed [rel='count_"+itemdomain+"']").html())+1));
									}
									if (response.rating == 'true') $("[rel='r_"+itemdomain+"']").html('<span class="wot"><span class="box box4" title="See Rating for '+itemdomain+'"><a href="http://www.mywot.com/en/scorecard/'+itemdomain+'" target="_blank">Rating</a></span></span>');
								}
								if (mode == 'block') {
									if (bkg.in_array(itemdomain, response.temp)) {
										$("#allowed [rel='"+itemdomain+"'] .x_whitelist").removeClass("selected");
										$("#allowed [rel='"+itemdomain+"'] .x_bypass").addClass("selected");
									} else {
										$("#allowed [rel='"+itemdomain+"'] .x_bypass").remove();
									}
								}
								$("#allowed [rel='x_"+tabdomain+"']").children().first().css("font-weight", "bold");
								$("#allowed").prepend($("#allowed [rel='x_"+tabdomain+"']"));
								if (tabdomain.substr(0,4) == 'www.') {
									$("#allowed [rel='x_"+tabdomain.substr(4)+"']").children().first().css("font-weight", "bold");
									$("#allowed").prepend($("#allowed [rel='x_"+tabdomain.substr(4)+"']"));
								} else {
									$("#allowed [rel='x_www."+tabdomain+"']").children().first().css("font-weight", "bold");
									$("#allowed").prepend($("#allowed [rel='x_www."+tabdomain+"']"));
								}
							}
						}
						var blockedCount = blocked.length;
						var allowedCount = allowed.length;
						if (responseBlockedCount != 0 && blockedCount == 0) $(".thirds:first").html('<i>None</i>');
						if (responseAllowedCount != 0 && allowedCount == 0) $(".allowed").parent().remove();
						$(".x_whitelist,.x_blacklist,.x_bypass,.x_trust").bind("click", x_savehandle);
						if (mode == 'block') {
							if (($('.thirds .thirditem').length == 1 && $('.thirds .thirditem[rel="x_no.script"]').length == 1) || ($('.thirds .thirditem').length == 1 && $('.thirds .thirditem[rel="x_web.bug"]').length == 1)) {
								// empty space
							} else {
								if (blockedCount != 0 && undesirablecount != blockedCount) {
									if (responseAllowedCount == 0) $(".thirds").append('<br /><div class="box box3 allowsession" title="Allow All Blocked For Session (not including webbugs/noscript tags/annoyances)">Allow All Blocked For Session</div>');
									else if (responseAllowedCount != 0) $("#allowed").append('<br /><div class="box box3 allowsession" title="Allow All Blocked For Session (not including webbugs/noscript tags/annoyances)">Allow All Blocked For Session</div>');
								} else {
									if (responseAllowedCount == 0) $(".thirds").append('<br />');
									else if (responseAllowedCount != 0) $("#allowed").append('<br />');
								}
							}
						} else {
							if (allowedCount != 0 && responseAllowedCount == 0) $(".thirds").append('<br /><div class="box box3 allowsession" title="Block All Allowed For Session">Block All Allowed For Session</div>');
							else if (allowedCount != 0 && responseAllowedCount != 0) $("#allowed").append('<br /><div class="box box35 allowsession" title="Block All Allowed For Session">Block All Allowed For Session</div>');
						}
						$(".allowsession").bind("click", bulkhandle);
						if (response.temp) {
							if (blockedCount != 0 && responseAllowedCount == 0) $(".thirds").append('<div class="box box5 prevoke" title="Revoke All Temporary Permissions">Revoke All Temporary Permissions</div>');
							else if (blockedCount != 0 && responseAllowedCount != 0) $("#allowed").append('<div class="box box5 prevoke" title="Revoke All Temporary Permissions">Revoke All Temporary Permissions</div>');
							$(".prevoke").bind("click", revokealltemp);
						}
					}
					$(".selected:not(.pbypass)").unbind("click", savehandle);
					$(".selected:not(.x_bypass)").unbind("click", x_savehandle);
					$("#parent").prepend('<div class="box box1 pallow" rel="0" title="Allow Current Domain">Allow</div><div class="box box1 ptrust" rel="3" title="Trust Entire Domain">Trust</div><div class="box box2 pdeny" rel="1" title="Deny">Deny</div><div class="box box2 ptrust" rel="4" title="Distrust Entire Domain">Distrust</div><div class="box box3 pbypass" rel="2" title="Temp.">Temp.</div>').attr("sn_list",response.enable);
					$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
					var inTemp = bkg.in_array(tabdomain, response.temp);
					if (response.enable == '1' || response.enable == '4') {
						if (inTemp) {
							$(".pbypass").addClass("selected");
							$("[rel='"+tabdomain+"'] .x_bypass").addClass('selected');
							$("[rel='"+tabdomain+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
							var tabdomainfriendly = tabdomain.replace(/\./g,"_");
							$(".x_"+tabdomainfriendly).remove();
							if (tabdomain.substr(0,4) == 'www.') {
								$("[rel='"+tabdomain.substr(4)+"'] .x_bypass").addClass('selected');
								$("[rel='"+tabdomain.substr(4)+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
								$(".x_"+tabdomain.substr(4).replace(/\./g,"_")).remove();
							} else {
								$("[rel='www."+tabdomain+"'] .x_bypass").addClass('selected');
								$("[rel='www."+tabdomain+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
								$(".x_www_"+tabdomainfriendly).remove();
							}
						} else {
							$(".pbypass").remove();
							$(".pdeny").unbind("click", savehandle).addClass("selected");
							if (response.enable == '4') $(".ptrust[rel='4']").unbind("click", savehandle).addClass("selected");
							$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
							$(".pclear").bind("click", removehandle);
						}
						var domainCheckStatus = bkg.domainCheck(taburl, 1);
						var baddiesStatus = bkg.baddies(taburl, response.annoyancesmode, response.antisocial);
						if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesStatus == 1) || (response.antisocial == 'true' && baddiesStatus == '2')) {
							if (response.antisocial == 'true' && baddiesStatus == '2') {
								$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (antisocial)").text("Antisocial");
							} else {
								$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
							}
							$(".pbypass").remove();
							$(".ptrust[rel='3']").remove();
							$(".ptrust[rel='4']").remove();
							$(".pclear").remove();
							$(".pallow").remove();
						} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesStatus == 1) {
							$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
							$(".pclear").remove();
						}
					} else if (response.enable == '0' || response.enable == '3') {
						if (inTemp) {
							$(".pbypass").addClass("selected");
							$("[rel='"+tabdomain+"'] .x_bypass").addClass('selected');
							$("[rel='"+tabdomain+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
							$(".x_"+tabdomain.replace(/\./g,"_")).remove();
							if (tabdomain.substr(0,4) == 'www.') {
								$("[rel='"+tabdomain.substr(4)+"'] .x_bypass").addClass('selected');
								$("[rel='"+tabdomain.substr(4)+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
								$(".x_"+tabdomain.substr(4).replace(/\./g,"_")).remove();
							} else {
								$("[rel='www."+tabdomain+"'] .x_bypass").addClass('selected');
								$("[rel='www."+tabdomain+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
								$(".x_www_"+tabdomain.replace(/\./g,"_")).remove();
							}
						} else {
							$(".pbypass").remove();
							$(".pallow").unbind("click", savehandle).addClass("selected");
							if (response.enable == '3') $(".ptrust[rel='3']").unbind("click", savehandle).addClass("selected");
							$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
							$(".pclear").bind("click", removehandle);
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
	if (mode == 'block') {
		var urlarray = blocked;
		var message = 'allow all blocked';
	} else {
		var urlarray = allowed;
		var message = 'block all allowed';
	}
	if (el.hasClass("selected")) {
		chrome.extension.sendRequest({reqtype: "remove-temp", url: urlarray, mode: mode, oldlist: el.parent().attr("sn_list")});
		el.removeClass('selected');
	} else {
		chrome.extension.sendRequest({reqtype: "temp", url: urlarray, mode: mode, oldlist: el.parent().attr("sn_list")});
		el.addClass('selected');
		window.close();
	}
}
function remove(url, el, type) {
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
			if (url.substr(0,4) == 'www.') {
				$("[rel='"+url.substr(4)+"'], #parent").attr("sn_list", "-1");
				$(".pbypass, [rel='"+url.substr(4)+"'] .x_bypass").remove();
				$(".x_"+url.substr(4).replace(/\./g,"_")).parent().append('<span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span>');
				$("[rel='"+url.substr(4)+"'] .x_bypass").bind("click", x_savehandle);
			} else {
				$("[rel='www."+url+"'], #parent").attr("sn_list", "-1");
				$(".pbypass, [rel='www."+url+"'] .x_bypass").remove();
				$(".x_www_"+url.replace(/\./g,"_")).parent().append('<span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span>');
				$("[rel='www."+url+"'] .x_bypass").bind("click", x_savehandle);
			}
			$(".pbypass, [rel='"+url+"'] .x_bypass").remove();
			$(".x_"+url.replace(/\./g,"_")).parent().append('<span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span>');
			$("#parent").append('<div class="box box3 pbypass" rel="2" title="Temp.">Temp.</div>');
			$("[rel='"+url+"'] .x_bypass").bind("click", x_savehandle);
			$(".pbypass").bind("click", savehandle);
		}
		if (type == '0') {
			$(".x_"+url.replace(/\./g,"_")).parent().children().removeClass("selected").unbind("click", x_savehandle);
			$(".x_"+url.replace(/\./g,"_")).parent().children().bind("click", x_savehandle);
			$(".x_"+url.replace(/\./g,"_")).remove();
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected").unbind("click", savehandle);
			$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
			el.remove();
			if (url.substr(0,4) == 'www.') {
				$(".x_"+url.substr(4).replace(/\./g,"_")).parent().children().removeClass("selected").unbind("click", x_savehandle);
				$(".x_"+url.substr(4).replace(/\./g,"_")).parent().children().bind("click", x_savehandle);
				$(".x_"+url.substr(4).replace(/\./g,"_")).remove();
			} else {
				$(".x_www_"+url.replace(/\./g,"_")).parent().children().removeClass("selected").unbind("click", x_savehandle);
				$(".x_www_"+url.replace(/\./g,"_")).parent().children().bind("click", x_savehandle);
				$(".x_www_"+url.replace(/\./g,"_")).remove();
			}
		} else if (type == '1') {
			if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) {
				$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected").unbind("click", savehandle);
				$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
				$('.pclear').remove();
			}
			el.parent().children().removeClass("selected").unbind("click", x_savehandle);
			el.parent().children().bind("click", x_savehandle);
			el.remove();
		}
		if (mode == 'allow') $(".pbypass,.x_bypass").html("Temp.").attr("title","Temp.");
	}
}
function save(url, el, type) {
	var val = el.attr("rel");
	var trustType = bkg.trustCheck(url);
	if (val < 2) chrome.extension.sendRequest({reqtype: "save", url: url, list: val});
	else if (val == 2) {
		if (trustType) url = '**.'+bkg.getDomain(url);
		if (el.hasClass("selected")) {
			chrome.extension.sendRequest({reqtype: "remove-temp", url: url, mode: mode, oldlist: el.parent().attr("sn_list")});
			selected = true;
		} else chrome.extension.sendRequest({reqtype: "temp", url: url, mode: mode, oldlist: el.parent().attr("sn_list")});
	} else if (val == 3) {
		bkg.topHandler(url, 0);
		val = 0;
	} else if (val == 4) {
		bkg.topHandler(url, 1);
		val = 1;
	}
	if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) chrome.extension.sendRequest({reqtype: "refresh-page-icon", tid: tabid, type: val});
	if (closepage == 'true') window.close();
	else {
		if (type == '0') {
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected").unbind("click", savehandle);
			$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
			if (url.substr(0,4) == 'www.') {
				$("[rel='"+url.substr(4)+"']").children().removeClass("selected").unbind("click", x_savehandle);
				$("[rel='"+url.substr(4)+"']").children().bind("click", x_savehandle);
				$(".x_"+url.substr(4).replace(/\./g,"_")).remove();
				if (val == 0) $("[rel='"+url.substr(4)+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 1) $("[rel='"+url.substr(4)+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 2) $("[rel='"+url.substr(4)+"'] .x_bypass").addClass('selected');
				if (trustType == '1') $("[rel='"+url.substr(4)+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
				if (trustType == '2') $("[rel='"+url.substr(4)+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
			} else {
				$("[rel='www."+url+"']").children().removeClass("selected").unbind("click", x_savehandle);
				$("[rel='www."+url+"']").children().bind("click", x_savehandle);
				$(".x_www_"+url.replace(/\./g,"_")).remove();
				if (val == 0) $("[rel='www."+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 1) $("[rel='www."+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 2) $("[rel='www."+url+"'] .x_bypass").addClass('selected');
				if (trustType == '1') $("[rel='www."+url+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
				if (trustType == '2') $("[rel='www."+url+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
			}
			$("[rel='"+url+"']").children().removeClass("selected").unbind("click", x_savehandle);
			$("[rel='"+url+"']").children().bind("click", x_savehandle);
			$(".pclear").remove();
			$(".x_"+url.replace(/\./g,"_")).remove();
			if (val == 0) $("[rel='"+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
			else if (val == 1) $("[rel='"+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
			else if (val == 2) $("[rel='"+url+"'] .x_bypass").addClass('selected');
			if (trustType == '1') {
				$(".pallow").addClass('selected').unbind("click", savehandle);
				$("[rel='"+url+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
			} else if (trustType == '2') {
				$(".pdeny").addClass('selected').unbind("click", savehandle);
				$("[rel='"+url+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
			}
			if (val < 2) {
				if (url.substr(0,4) == 'www.') {
					$("[rel='"+url.substr(4)+"']").prepend('<span class="box box4 x_'+url.substr(4).replace(/\./g,"_")+'" title="Clear">Clear</span>')
					$(".x_"+url.substr(4).replace(/\./g,"_")).bind("click", x_removehandle);
				} else {
					$("[rel='www."+url+"']").prepend('<span class="box box4 x_www_'+url.replace(/\./g,"_")+'" title="Clear">Clear</span>')
					$(".x_www_"+url.replace(/\./g,"_")).bind("click", x_removehandle);
				}
				$("[rel='"+url+"']").prepend('<span class="box box4 x_'+url.replace(/\./g,"_")+'" title="Clear">Clear</span>')
				$(".x_"+url.replace(/\./g,"_")).bind("click", x_removehandle);
				el.addClass('selected').unbind("click", savehandle);
				$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
				$(".pclear").bind("click", removehandle);
			} else {
				if (!selected) {
						el.addClass('selected');
						$("[rel='"+url+"'] .x_bypass").addClass('selected');
						if (url.substr(0,4) == 'www.') $("[rel='"+url.substr(4)+"'] .x_bypass").addClass('selected');
						else $("[rel='www."+url+"'] .x_bypass").addClass('selected');
				} else {
					$("[rel='"+url+"'] .x_bypass").removeClass('selected');
					if (url.substr(0,4) == 'www.') $("[rel='"+url.substr(4)+"'] .x_bypass").removeClass('selected');
					else $("[rel='www."+url+"'] .x_bypass").removeClass('selected');
				}
			}
		} else if (type == '1') {
			el.parent().children().removeClass("selected").unbind("click", x_savehandle);
			el.parent().children().bind("click", x_savehandle);
			$(".x_"+url.replace(/\./g,"_")).remove();
			if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) {
				$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected").unbind("click", savehandle);
				$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
				$(".pclear").remove();
				if (val == 0) $(".pallow").addClass('selected').unbind("click", savehandle);
				else if (val == 1) $(".pdeny").addClass('selected').unbind("click", savehandle);
				if ((trustType) && val != 2) {
					if (trustType == '1') $(".ptrust[rel='3']").addClass('selected').unbind("click", savehandle);
					if (trustType == '2') $(".ptrust[rel='4']").addClass('selected').unbind("click", savehandle);
				}
			}
			if (val < 2) {
				if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) {
					$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
					$(".pclear").bind("click", removehandle);
				}
				el.addClass('selected').unbind("click", savehandle);
				el.parent().prepend('<span class="box box4 x_'+url.replace(/\./g,"_")+'" title="Clear">Clear</span>');
				$(".x_"+url.replace(/\./g,"_")).bind("click", x_removehandle);
				if ((trustType) && val != 2) {
					if (trustType == '1') $("[rel='"+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
					else if (trustType == '1') $("[rel='"+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
				}
			} else {
				if (!selected) {
					el.addClass('selected');
					if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) $(".pbypass").addClass('selected');
				} else {
					if (url == tabdomain || (url.substr(0,4) == 'www.' && tabdomain.substr(0,4) != 'www.' && url.substr(4) == tabdomain) || (tabdomain.substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && tabdomain.substr(4) == url)) $(".pbypass").removeClass('selected');
				}
			}
		}
	}
	selected = false;
}