document.addEventListener('DOMContentLoaded', function () {
	init();
	$("#pop_quick").click(function() { openTab('http://andryou.com/2011/08/21/scriptno-a-quick-guide/'); });
	$("#pop_overview").click(function() { openTab('http://andryou.com/2011/08/14/scriptno/'); });
	$("#pop_project").click(function() { openTab('http://code.google.com/p/scriptno/'); });
	$("#pop_faq").click(function() { openTab('http://code.google.com/p/scriptno/wiki/FrequentlyAskedQuestions'); });
	$("#pop_options").click(function() { openTab(chrome.extension.getURL('html/options.html')); });
	$("#pop_webstore").click(function() { openTab('https://chrome.google.com/webstore/detail/oiigbmnaadbkfbmpbfijlflahbdbdgdf'); });
	$("#pop_close").click(function() { window.close(); });
});
var version = (function () {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
		xhr.send(null);
		return JSON.parse(xhr.responseText).version;
	}());
	var port = chrome.extension.connect({name: "popuplifeline"});
	var bkg = chrome.extension.getBackgroundPage();
	var closepage, mode, taburl, tabid;
	var selected = false;
	var undesirablecount = 0;
	var blocked = [];
	var allowed = [];
	var statuschange = function() {
		port.postMessage({url: taburloriginal, tid: tabid});
		bkg.statuschanger();
		window.close();
	};
	var revokealltemp = function() {
		port.postMessage({url: taburloriginal, tid: tabid});
		bkg.revokeTemp();
		window.close();
	};
	var bulkhandle = function() {
		port.postMessage({url: taburloriginal, tid: tabid});
		bulk($(this));
	};
	var removehandle = function() {
		remove(bkg.extractDomainFromURL(taburl), $(this), '0');
	};
	var x_removehandle = function() {
		remove($(this).parent().attr("rel"), $(this), '1');
	};
	var savehandle = function() {
		port.postMessage({url: taburloriginal, tid: tabid});
		save(bkg.extractDomainFromURL(taburl), $(this), '0');
	};
	var x_savehandle = function() {
		port.postMessage({url: taburloriginal, tid: tabid});
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
	function init() {
		$("#version").html(version);
		chrome.windows.getCurrent(function(w) {
			chrome.tabs.getSelected(w.id, function(tab) {
				taburloriginal = tab.url;
				taburl = taburloriginal.toLowerCase();
				tabid = tab.id;
				if (taburl.substr(0, 4) != 'http') {
					$("#currentdomain").html("Not filtered");
					$(".thirds").html('<i>This tab has loaded no external resources</i>');
				} else {
					chrome.extension.sendRequest({reqtype: "get-list", url: taburl, tid: tabid}, function(response) {
						mode = response.mode;
						$("#currentdomain").html('<span title="'+bkg.extractDomainFromURL(taburl)+'">'+bkg.extractDomainFromURL(taburl)+'</span>');
						if ((response.blockeditems.length == 0 && response.alloweditems.length == 0) || response.status == 'false') {
							if (response.status == 'false') {
								$(".thirds").html('<i>ScriptSafe is disabled</i>');
								$("#parent").append('<div class="box box1 snstatus" title="Enable ScriptSafe">Enable ScriptSafe</div>');
								$(".snstatus").bind("click", statuschange);
								return false;
							}
							$(".thirds").html('<i>This tab has loaded no external resources</i>');
						} else {
							if (response.blockeditems.length > 0) {
								if (response.domainsort == 'true') response.blockeditems = bkg.domainSort(response.blockeditems);
								else response.blockeditems.sort();
								$(".thirds").parent().after("<tr><td class='bolded' style='padding-top: 5px;'><span class='blocked'>Blocked Resources</span></td><td id='parent'></td></tr><tr><td class='thirds'></td><td></td></tr>");
								$(".thirds:first").parent().remove();
								$("#parent").attr("rowspan","2");
								for (i=0;i<response.blockeditems.length;i++) {
									itemdomain = bkg.extractDomainFromURL(response.blockeditems[i][0]).toLowerCase();
									if (response.blockeditems[i][1] == 'NOSCRIPT') itemdomain = 'no.script';
									else if (response.blockeditems[i][1] == 'WEBBUG') itemdomain = 'web.bug';
									if (itemdomain) {
										baddiesstatus = bkg.baddies(response.blockeditems[i][0].toLowerCase(), response.annoyancesmode, response.antisocial);
										itemdomainanchor = itemdomain + baddiesstatus;
										blocked.push([itemdomain, bkg.domainCheck(itemdomain)]);
										if ($('.thirds .thirditem[rel="x_'+itemdomainanchor+'"]').length == 0) {
											if (bkg.domainCheck(itemdomain, 1) == '1') {
												trustval0 = '';
												trustval1 = '';
												if (bkg.trustCheck(itemdomain, 0)) {
													trustval0 = ' selected';
													allowedtype = 3;
												} else if (bkg.trustCheck(itemdomain, 1)) {
													trustval1 = ' selected';
													allowedtype = 4;
												} else allowedtype = 1;
												$(".thirds").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainanchor+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box1 x_whitelist" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist selected" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
												if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && bkg.domainCheck(itemdomain, 1) == '-1' && baddiesstatus == 1) || (response.antisocial == 'true' && baddiesstatus == '2')) {
												
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
										if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && bkg.domainCheck(itemdomain, 1) == '-1' && baddiesstatus == 1) || (response.antisocial == 'true' && baddiesstatus == '2')) {
											$(".thirds").append($(".thirds [rel='x_"+itemdomainanchor+"']"));
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box1, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_trust, [rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .box3").remove();
											if (response.antisocial == 'true' && baddiesstatus == '2') {
												$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Antisocial").html("Antisocial").addClass("selected");
											} else {
												$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
											}
											undesirablecount++;
										} else if (response.annoyances == 'true' && bkg.domainCheck(itemdomain, 1) == '-1' && baddiesstatus == '1') {
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_"+itemdomain.replace(/\./g,"_")).remove();
											$("[rel='x_"+itemdomainanchor+"'] [rel='"+itemdomain+"'] .x_blacklist").attr("title","Unwanted Content Provider").html("Unwanted").addClass("selected");
										}
									}
									if (mode == 'allow') {
										if (bkg.in_array(itemdomain, JSON.parse(response.temp)) || (itemdomain.substr(0,4) == 'www.' && bkg.in_array(itemdomain.substr(4), JSON.parse(response.temp)))) {
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
									$(".thirds [rel='x_"+bkg.extractDomainFromURL(taburl)+"']").children().first().css("font-weight", "bold");
									$(".thirds").prepend($(".thirds [rel='x_"+bkg.extractDomainFromURL(taburl)+"']"));
									if (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.') {
										$(".thirds [rel='x_"+bkg.extractDomainFromURL(taburl).substr(4)+"']").children().first().css("font-weight", "bold");
										$(".thirds").prepend($(".thirds [rel='x_"+bkg.extractDomainFromURL(taburl).substr(4)+"']"));
									} else {
										$(".thirds [rel='x_www."+bkg.extractDomainFromURL(taburl)+"']").children().first().css("font-weight", "bold");
										$(".thirds").prepend($(".thirds [rel='x_www."+bkg.extractDomainFromURL(taburl)+"']"));
									}
								}
							}
							if (response.alloweditems.length > 0) {
								if (response.domainsort == 'true') response.alloweditems = bkg.domainSort(response.alloweditems);
								else response.alloweditems.sort();
								$("#parent").attr("rowspan","3");
								$(".thirds").parent().parent().append("<tr><td class='bolded' style='padding-top: 15px;'><span class='allowed'>Allowed Resources</span></td><td class='bolded'></td></tr><tr><td class='thirds' id='allowed'></td><td></td></tr>");
								if (blocked.length > 0) $("#parent").attr("rowspan","4");
								else $("td.bolded").css('padding-top', '0px');
								for (i=0;i<response.alloweditems.length;i++) {
									itemdomain = bkg.extractDomainFromURL(response.alloweditems[i][0]).toLowerCase();
									if (itemdomain) {
										allowed.push([itemdomain, bkg.domainCheck(itemdomain)]);
										if ($('#allowed .choices[rel="'+itemdomain+'"]').length == 0) {
											if (bkg.domainCheck(itemdomain, 1) == '0') {
												trustval0 = '';
												trustval1 = '';
												if (bkg.trustCheck(itemdomain, 0)) {
													trustval0 = ' selected';
													allowedtype = 3;
												} else if (bkg.trustCheck(itemdomain, 1)) {
													trustval1 = ' selected';
													allowedtype = 4;
												} else allowedtype = 0;
												$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomain+'"><span><span>'+itemdomain+'</span> (<span rel="count_'+itemdomain+'">1</span>)</span><br /><span rel="r_'+itemdomain+'"></span><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box1 x_whitelist selected" rel="0" title="Allow Domain">Allow</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">Trust</span><span class="box box2 x_blacklist" rel="1" title="Deny">Deny</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">Distrust</span><span class="box box3 x_bypass" rel="2" title="Temp.">Temp.</span></span></div>');
												if (mode == 'block') {
													$("#allowed [rel='"+itemdomain+"']").prepend('<span class="box box4 x_'+itemdomain.replace(/\./g,"_")+'" title="Clear">Clear</span>');
													$("#allowed .x_"+itemdomain.replace(/\./g,"_")).bind("click", x_removehandle);
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
										if (bkg.in_array(itemdomain, JSON.parse(response.temp)) || (itemdomain.substr(0,4) == 'www.' && bkg.in_array(itemdomain.substr(4), JSON.parse(response.temp)))) {
											$("#allowed [rel='"+itemdomain+"'] .x_whitelist").removeClass("selected");
											$("#allowed [rel='"+itemdomain+"'] .x_bypass").addClass("selected");
										} else {
											$("#allowed [rel='"+itemdomain+"'] .x_bypass").remove();
										}
									}
									$("#allowed [rel='x_"+bkg.extractDomainFromURL(taburl)+"']").children().first().css("font-weight", "bold");
									$("#allowed").prepend($("#allowed [rel='x_"+bkg.extractDomainFromURL(taburl)+"']"));
									if (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.') {
										$("#allowed [rel='x_"+bkg.extractDomainFromURL(taburl).substr(4)+"']").children().first().css("font-weight", "bold");
										$("#allowed").prepend($("#allowed [rel='x_"+bkg.extractDomainFromURL(taburl).substr(4)+"']"));
									} else {
										$("#allowed [rel='x_www."+bkg.extractDomainFromURL(taburl)+"']").children().first().css("font-weight", "bold");
										$("#allowed").prepend($("#allowed [rel='x_www."+bkg.extractDomainFromURL(taburl)+"']"));
									}
								}
							}
							if (response.blockeditems.length > 0 && blocked.length == 0) $(".thirds:first").html('<i>None</i>');
							if (response.alloweditems.length > 0 && allowed.length == 0) $(".allowed").parent().remove();
							$(".x_whitelist,.x_blacklist,.x_bypass,.x_trust").bind("click", x_savehandle);
							if (mode == 'block') {
								if (($('.thirds .thirditem').length == 1 && $('.thirds .thirditem[rel="x_no.script"]').length == 1) || ($('.thirds .thirditem').length == 1 && $('.thirds .thirditem[rel="x_web.bug"]').length == 1)) {
									//
								} else {
									if (blocked.length > 0 && undesirablecount != blocked.length) {
										if (response.alloweditems.length == 0) $(".thirds").append('<br /><div class="box box3 allowsession" title="Allow All Blocked For Session (not including webbugs/noscript tags/annoyances)">Allow All Blocked For Session</div>');
										else if (response.alloweditems.length > 0) $("#allowed").append('<br /><div class="box box3 allowsession" title="Allow All Blocked For Session (not including webbugs/noscript tags/annoyances)">Allow All Blocked For Session</div>');
									} else {
										if (response.alloweditems.length == 0) $(".thirds").append('<br />');
										else if (response.alloweditems.length > 0) $("#allowed").append('<br />');
									}
								}
							} else {
								if (allowed.length > 0 && response.alloweditems.length == 0) $(".thirds").append('<br /><div class="box box3 allowsession" title="Block All Allowed For Session">Block All Allowed For Session</div>');
								else if (allowed.length > 0 && response.alloweditems.length > 0) $("#allowed").append('<br /><div class="box box35 allowsession" title="Block All Allowed For Session">Block All Allowed For Session</div>');
							}
							$(".allowsession").bind("click", bulkhandle);
							if (JSON.parse(response.temp).length != 0) {
								if (blocked.length > 0 && response.alloweditems.length == 0) $(".thirds").append('<div class="box box5 prevoke" title="Revoke All Temporary Permissions">Revoke All Temporary Permissions</div>');
								else if (blocked.length > 0 && response.alloweditems.length > 0) $("#allowed").append('<div class="box box5 prevoke" title="Revoke All Temporary Permissions">Revoke All Temporary Permissions</div>');
								$(".prevoke").bind("click", revokealltemp);
							}
						}
						$(".selected:not(.pbypass)").unbind("click", savehandle);
						$(".selected:not(.x_bypass)").unbind("click", x_savehandle);
						$("#parent").prepend('<div class="box box1 pallow" rel="0" title="Allow Current Domain">Allow</div><div class="box box1 ptrust" rel="3" title="Trust Entire Domain">Trust</div><div class="box box2 pdeny" rel="1" title="Deny">Deny</div><div class="box box2 ptrust" rel="4" title="Distrust Entire Domain">Distrust</div><div class="box box3 pbypass" rel="2" title="Temp.">Temp.</div>').attr("sn_list",response.enable);
						$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
						if (response.enable == '1' || response.enable == '4') {
							if (bkg.in_array(bkg.extractDomainFromURL(taburl), JSON.parse(response.temp)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && bkg.in_array(bkg.extractDomainFromURL(taburl).substr(4), JSON.parse(response.temp)))) {
								$(".pbypass").addClass("selected");
								$("[rel='"+bkg.extractDomainFromURL(taburl)+"'] .x_bypass").addClass('selected');
								$("[rel='"+bkg.extractDomainFromURL(taburl)+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
								$(".x_"+bkg.extractDomainFromURL(taburl).replace(/\./g,"_")).remove();
								if (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.') {
									$("[rel='"+bkg.extractDomainFromURL(taburl).substr(4)+"'] .x_bypass").addClass('selected');
									$("[rel='"+bkg.extractDomainFromURL(taburl).substr(4)+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
									$(".x_"+bkg.extractDomainFromURL(taburl).substr(4).replace(/\./g,"_")).remove();
								} else {
									$("[rel='www."+bkg.extractDomainFromURL(taburl)+"'] .x_bypass").addClass('selected');
									$("[rel='www."+bkg.extractDomainFromURL(taburl)+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
									$(".x_www_"+bkg.extractDomainFromURL(taburl).replace(/\./g,"_")).remove();
								}
							} else {
								$(".pbypass").remove();
								$(".pdeny").unbind("click", savehandle).addClass("selected");
								if (response.enable == '4') $(".ptrust[rel='4']").unbind("click", savehandle).addClass("selected");
								$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
								$(".pclear").bind("click", removehandle);
							}
							if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && bkg.domainCheck(itemdomain, 1) == '-1' && bkg.baddies(taburl, response.annoyancesmode, response.antisocial) == 1) || (response.antisocial == 'true' && bkg.baddies(taburl, response.annoyancesmode, response.antisocial) == '2')) {
								if (response.antisocial == 'true' && bkg.baddies(taburl, response.annoyancesmode, response.antisocial) == '2') {
									$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (antisocial)").text("Antisocial");
								} else {
									$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
								}
								$(".pbypass").remove();
								$(".ptrust[rel='3']").remove();
								$(".ptrust[rel='4']").remove();
								$(".pclear").remove();
								$(".pallow").remove();
							} else if (response.annoyances == 'true' && bkg.domainCheck(itemdomain, 1) == '-1' && bkg.baddies(taburl, response.annoyancesmode, response.antisocial) == 1) {
								$(".pdeny").unbind("click", savehandle).addClass("selected").attr("title","Blocked (provider of unwanted content)").text("Blocked");
								$(".pclear").remove();
							}
						} else if (response.enable == '0' || response.enable == '3') {
							if (bkg.in_array(bkg.extractDomainFromURL(taburl), JSON.parse(response.temp)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && bkg.in_array(bkg.extractDomainFromURL(taburl).substr(4), JSON.parse(response.temp)))) {
								$(".pbypass").addClass("selected");
								$("[rel='"+bkg.extractDomainFromURL(taburl)+"'] .x_bypass").addClass('selected');
								$("[rel='"+bkg.extractDomainFromURL(taburl)+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
								$(".x_"+bkg.extractDomainFromURL(taburl).replace(/\./g,"_")).remove();
								if (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.') {
									$("[rel='"+bkg.extractDomainFromURL(taburl).substr(4)+"'] .x_bypass").addClass('selected');
									$("[rel='"+bkg.extractDomainFromURL(taburl).substr(4)+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
									$(".x_"+bkg.extractDomainFromURL(taburl).substr(4).replace(/\./g,"_")).remove();
								} else {
									$("[rel='www."+bkg.extractDomainFromURL(taburl)+"'] .x_bypass").addClass('selected');
									$("[rel='www."+bkg.extractDomainFromURL(taburl)+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
									$(".x_www_"+bkg.extractDomainFromURL(taburl).replace(/\./g,"_")).remove();
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
			urlarray = blocked;
			message = 'allow all blocked';
		} else {
			urlarray = allowed;
			message = 'block all allowed';
		}
		if (el.hasClass("selected")) {
			chrome.extension.sendRequest({reqtype: "remove-temp", url: urlarray, mode: mode, oldlist: el.parent().attr("sn_list")});
			el.removeClass('selected');
		} else {
			//if (confirm("Are you sure you want to temporarily "+message+" resources?")) {
				chrome.extension.sendRequest({reqtype: "temp", url: urlarray, mode: mode, oldlist: el.parent().attr("sn_list")});
				el.addClass('selected');
				window.close();
			//} else {
			//	chrome.extension.sendRequest({reqtype: "remove-temp", url: urlarray, mode: mode, oldlist: el.parent().attr("sn_list")});
			//	el.removeClass('selected');
			//}
		}
	}
	function remove(url, el, type) {
		//if (confirm("Are you sure you want to remove "+url+" out of your lists?")) {
			port.postMessage({url: taburloriginal, tid: tabid});
			if (bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) {
				bkg.domainHandler('*.'+bkg.getDomain(url), 2);
				bkg.domainHandler('*.'+bkg.getDomain(url), 2, 1);
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
					if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) {
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
		//}
	}
	function save(url, el, type) {
		val = el.attr("rel");
		if (val < 2) chrome.extension.sendRequest({reqtype: "save", url: url, list: val});
		else if (val == 2) {
			processurl = url;
			if (bkg.trustCheck(processurl, 0) || bkg.trustCheck(processurl, 1)) processurl = '*.'+bkg.getDomain(processurl);
			if (el.hasClass("selected")) {
				chrome.extension.sendRequest({reqtype: "remove-temp", url: processurl, mode: mode, oldlist: el.parent().attr("sn_list")});
				selected = true;
			} else chrome.extension.sendRequest({reqtype: "temp", url: processurl, mode: mode, oldlist: el.parent().attr("sn_list")});
		} else if (val == 3) {
			bkg.topHandler(url, 0);
			val = 0;
		} else if (val == 4) {
			bkg.topHandler(url, 1);
			val = 1;
		}
		if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) chrome.extension.sendRequest({reqtype: "refresh-page-icon", tid: tabid, type: val});
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
					if (bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) {
						if (bkg.trustCheck(url, 0)) $("[rel='"+url.substr(4)+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
						if (bkg.trustCheck(url, 1)) $("[rel='"+url.substr(4)+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
					}
				} else {
					$("[rel='www."+url+"']").children().removeClass("selected").unbind("click", x_savehandle);
					$("[rel='www."+url+"']").children().bind("click", x_savehandle);
					$(".x_www_"+url.replace(/\./g,"_")).remove();
					if (val == 0) $("[rel='www."+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
					else if (val == 1) $("[rel='www."+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
					else if (val == 2) $("[rel='www."+url+"'] .x_bypass").addClass('selected');
					if (bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) {
						if (bkg.trustCheck(url, 0)) $("[rel='www."+url+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
						if (bkg.trustCheck(url, 1)) $("[rel='www."+url+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
						
					}
				}
				$("[rel='"+url+"']").children().removeClass("selected").unbind("click", x_savehandle);
				$("[rel='"+url+"']").children().bind("click", x_savehandle);
				$(".pclear").remove();
				$(".x_"+url.replace(/\./g,"_")).remove();
				if (val == 0) $("[rel='"+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 1) $("[rel='"+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
				else if (val == 2) $("[rel='"+url+"'] .x_bypass").addClass('selected');
				if ((bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) && val != 2) {
					if (bkg.trustCheck(url, 0)) {
						$(".pallow").addClass('selected').unbind("click", savehandle);
						$("[rel='"+url+"'] .x_trust[rel='3']").addClass('selected').unbind("click", x_savehandle);
					} else if (bkg.trustCheck(url, 1)) {
						$(".pdeny").addClass('selected').unbind("click", savehandle);
						$("[rel='"+url+"'] .x_trust[rel='4']").addClass('selected').unbind("click", x_savehandle);
					}
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
				if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) {
					$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected").unbind("click", savehandle);
					$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
					$(".pclear").remove();
					if (val == 0) $(".pallow").addClass('selected').unbind("click", savehandle);
					else if (val == 1) $(".pdeny").addClass('selected').unbind("click", savehandle);
					if ((bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) && val != 2) {
						if (bkg.trustCheck(url, 0)) $(".ptrust[rel='3']").addClass('selected').unbind("click", savehandle);
						if (bkg.trustCheck(url, 1)) $(".ptrust[rel='4']").addClass('selected').unbind("click", savehandle);
					}
				}
				if (val < 2) {
					if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) {
						$("#parent").append('<div class="box box4 pclear" title="Clear">Clear</div>');
						$(".pclear").bind("click", removehandle);
					}
					el.addClass('selected').unbind("click", savehandle);
					el.parent().prepend('<span class="box box4 x_'+url.replace(/\./g,"_")+'" title="Clear">Clear</span>');
					$(".x_"+url.replace(/\./g,"_")).bind("click", x_removehandle);
					if ((bkg.trustCheck(url, 0) || bkg.trustCheck(url, 1)) && val != 2) {
						if (bkg.trustCheck(url, 0)) $("[rel='"+url+"'] .x_whitelist").addClass('selected').unbind("click", x_savehandle);
						else if (bkg.trustCheck(url, 1)) $("[rel='"+url+"'] .x_blacklist").addClass('selected').unbind("click", x_savehandle);
					}
				} else {
					if (!selected) {
						el.addClass('selected');
						if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) $(".pbypass").addClass('selected');
					} else {
						if (url == bkg.extractDomainFromURL(taburl) || (url.substr(0,4) == 'www.' && bkg.extractDomainFromURL(taburl).substr(0,4) != 'www.' && url.substr(4) == bkg.extractDomainFromURL(taburl)) || (bkg.extractDomainFromURL(taburl).substr(0,4) == 'www.' && url.substr(0,4) != 'www.' && bkg.extractDomainFromURL(taburl).substr(4) == url)) $(".pbypass").removeClass('selected');
					}
				}
			}
		}
		selected = false;
	}