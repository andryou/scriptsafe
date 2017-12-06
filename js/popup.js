// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
var version = '1.0.9.3';
var port = chrome.runtime.connect({name: "popuplifeline"});
var bkg = chrome.extension.getBackgroundPage();
var closepage, mode, taburl, tabid, tabdomain;
var selected = false;
var intemp = false;
var blocked = [];
var allowed = [];
var statuschange = function() {
	$(this).hide();
	$(this).after(bkg.getLocale("disable")+': <span class="box box3" data-duration="5">5m</span> <span class="box box3" data-duration="15">15m</span> <span class="box box3" data-duration="30">30m</span> <span class="box box3" data-duration="60">1h</span> <span class="box box2" data-duration="">'+bkg.getLocale("forever")+'</span>');
	$("span[data-duration]").bind("click", statuschanger);
};
var statuschanger = function() {
	port.postMessage({url: taburl, tid: tabid});
	bkg.statuschanger($(this).attr('data-duration'));
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
	setTimeout(init, 150);
	$("#pop_ay").mouseup(function(e) { if (e.which != 3) openTab('https://twitter.com/andryou'); });
	$("#pop_docs").mouseup(function(e) { if (e.which != 3) openTab('https://www.andryou.com/scriptsafe/'); });
	$("#pop_project").mouseup(function(e) { if (e.which != 3) openTab('https://github.com/andryou/scriptsafe'); });
	$("#pop_options").mouseup(function(e) { if (e.which != 3) openTab(chrome.extension.getURL('html/options.html')); });
	$("#pop_log").mouseup(function(e) { if (e.which != 3) openTab(chrome.extension.getURL('html/recents.html')); });
	$("#pop_webstore").mouseup(function(e) { if (e.which != 3) openTab('https://chrome.google.com/webstore/detail/scriptsafe/oiigbmnaadbkfbmpbfijlflahbdbdgdf'); });
	$("#pop_close").mouseup(function(e) { if (e.which != 3) window.close(); }).attr('title', bkg.getLocale("close"));
	$("#pop_refresh").mouseup(function(e) { if (e.which != 3) chrome.tabs.reload(); window.close(); });
});
function init() {
	$("#version").html(version);
	$("#pop_options").html(bkg.getLocale("options"));
	chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
		tab = tab[0];
		taburl = tab.url;
		tabdomain = bkg.extractDomainFromURL(taburl);
		if (tabdomain.substr(0,4) == 'www.') tabdomain = tabdomain.substr(4);
		tabid = tab.id;
		if (tabdomain == 'chrome.google.com' || taburl.indexOf('chrome-extension://') == 0) {
			$("#currentdomain").html(bkg.getLocale("notfiltered"));
			$(".thirds").html('<i>'+bkg.getLocale("noexternal")+'</i>');
		} else {
			chrome.runtime.sendMessage({reqtype: "get-list", url: taburl, tid: tabid}, function(response) {
				if (typeof response === 'undefined' || response == 'reload') {
					if (tab.url.substring(0, 4) == 'http') {
						$("table").html('<tr><td>'+bkg.getLocale("recentlyupdated")+'</td></tr>');
					} else {
						$("table").html('<tr><td>'+bkg.getLocale("cannotprocess")+'</td></tr>');
					}
					return;
				}
				if (taburl.indexOf('data:text/html') == 0) {
					$("table").html('<tr><td>'+bkg.getLocale("cannotprocess")+'</td></tr>');
					return;
				}
				mode = response.mode;
				var responseBlockedCount = response.blockeditems.length;
				var responseAllowedCount = response.alloweditems.length;
				var tabInTemp = bkg.in_array(tabdomain, response.temp);
				var tabdomainfriendly = tabdomain.replace(/[.\[\]:]/g,"_");
				var tabdomainroot = bkg.getDomain(tabdomain);
				if (response.rating == 'true') $("#currentdomain").html('<span class="domainname domainoutput"><span class="wot"><a href="http://www.mywot.com/en/scorecard/'+tabdomain+'" target="_blank" title="'+bkg.getLocale("ratingbtn")+': '+tabdomain+'"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></a></span>'+tabdomain+'</span>');
				else $("#currentdomain").html('<span class="domainname domainoutput">'+tabdomain+'</span>');
				if ((responseBlockedCount == 0 && responseAllowedCount == 0) || response.status == 'false' || (response.mode == 'block' && (response.enable == '1' || response.enable == '4'))) {
					if (response.status == 'false') {
						$("#currentdomain").hide();
						$("html").css('width', '410px');
						$("body").css('width', '400px');
						$(".thirds").css('text-align', 'center').html('<i>'+bkg.getLocale("ssdisabled")+'</i>');
						$("#parent").css('text-align', 'center').append('<div class="box box1 snstatus" title="'+bkg.getLocale("enabless")+'">'+bkg.getLocale("enabless")+'</div>');
						$(".snstatus").bind("click", statuschanger);
						return false;
					}
					$(".thirds").html('<i>'+bkg.getLocale("noexternal")+'</i>');
				} else {
					if (responseBlockedCount != 0) {
						if (response.domainsort == 'true') response.blockeditems = bkg.domainSort(response.blockeditems);
						else response.blockeditems.sort();
						$(".thirds").parent().after("<tr><td class='bolded' style='height: 14px; padding-top: 5px;'><span class='blocked'>"+bkg.getLocale("blockeditems")+"</span></td></tr><tr><td class='thirds' id='blocked'></td></tr>");
						$(".thirds:first").parent().remove();
						for (var i=0;i<responseBlockedCount;i++) {
							var itemdomain = response.blockeditems[i][2];
							var fpitemdomain = response.blockeditems[i][2];
							if (response.blockeditems[i][1] == 'NOSCRIPT') itemdomain = 'no.script';
							else if (response.blockeditems[i][1] == 'WEBBUG') itemdomain = 'web.bug';
							else if (response.blockeditems[i][1] == 'Canvas Fingerprint') itemdomain = 'canvas.fingerprint';
							else if (response.blockeditems[i][1] == 'Canvas Font Access') itemdomain = 'canvas.font.access';
							else if (response.blockeditems[i][1] == 'Audio Fingerprint') itemdomain = 'audio.fingerprint';
							else if (response.blockeditems[i][1] == 'WebGL Fingerprint') itemdomain = 'webgl.fingerprint';
							else if (response.blockeditems[i][1] == 'Battery Fingerprint') itemdomain = 'battery.fingerprint';
							else if (response.blockeditems[i][1] == 'Device Enumeration') itemdomain = 'device.enumeration';
							else if (response.blockeditems[i][1] == 'Gamepad Enumeration') itemdomain = 'gamepad.enumeration';
							else if (response.blockeditems[i][1] == 'WebVR Enumeration') itemdomain = 'webvr.enumeration';
							else if (response.blockeditems[i][1] == 'Bluetooth Enumeration') itemdomain = 'bluetooth.enumeration';
							else if (response.blockeditems[i][1] == 'Spoofed Timezone') itemdomain = 'spoofed.timezone';
							else if (response.blockeditems[i][1] == 'Client Rectangles') itemdomain = 'client.rectangles';
							else if (response.blockeditems[i][1] == 'Clipboard Interference') itemdomain = 'clipboard.interference';
							else if (response.blockeditems[i][1] == 'Browser Plugins Enumeration') itemdomain = 'browser.plugins.enumeration';
							else if (response.blockeditems[i][1] == 'Data URL') itemdomain = 'data.url';
							if (itemdomain) {
								var baddiesstatus = response.blockeditems[i][5];
								var parentstatus = response.blockeditems[i][4];
								var itemdomainfriendly = itemdomain.replace(/[.\[\]:]/g,"_");
								var fpitemdomainfriendly = fpitemdomain.replace(/[.\[\]:]/g,"_");
								var domainCheckStatus = response.blockeditems[i][3];
								blocked.push(itemdomain);
								if ($('#blocked .thirditem[rel="x_'+itemdomainfriendly+'"]').length == 0) {
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
										var outputdomain = itemdomain;
										if (response.blockeditems[i][1] == 'NOSCRIPT' || response.blockeditems[i][1] == 'WEBBUG') outputdomain = '&lt;'+response.blockeditems[i][1]+'&gt;';
										else if (response.blockeditems[i][6]) outputdomain = response.blockeditems[i][1];
										$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="r_'+itemdomainfriendly+'"></span><span class="domainoutput">'+outputdomain+'</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span><br /><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</span><span class="box box2 x_blacklist selected" rel="1" title="Deny">'+bkg.getLocale("deny")+'</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
									} else {
										if (response.blockeditems[i][1] == 'NOSCRIPT' || response.blockeditems[i][1] == 'WEBBUG') {
											$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span>&lt;'+response.blockeditems[i][1]+'&gt;</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span></div>');
										} else if (response.blockeditems[i][1] == 'Spoofed Timezone' || response.blockeditems[i][1] == 'Data URL') {
											$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span>'+response.blockeditems[i][1]+'</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span></div>');
										} else if (response.blockeditems[i][6]) {
											if ($('#blocked .fpcat[rel="x_'+itemdomainfriendly+'"]').length == 0) {
												$("#blocked").append('<div class="fpcat" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><div class="fphead">'+response.blockeditems[i][1]+' (<span rel="count_'+itemdomainfriendly+'">1</span>)<span class="chevron"></span></div><div class="fpoptions details_'+itemdomainfriendly+'"><div class="fpitem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="fp_'+fpitemdomainfriendly+'" data-fpdomain="'+bkg.getDomain(fpitemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="rfp_'+fpitemdomainfriendly+'"></span><span class="domainoutput">'+fpitemdomain+'</span> (<span rel="fpcount_'+fpitemdomainfriendly+'">1</span>)</span><br /><span class="choices fpchoices" rel="'+fpitemdomain+'" sn_list="'+itemdomain+'"><span style="display: none;" class="box box4 fp_'+fpitemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div></div></div>');
											} else {
												if ($('#blocked .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"]').length == 0) $("#blocked .fpcat[rel='x_"+itemdomainfriendly+"'] .fpoptions").append('<div class="fpitem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="fp_'+fpitemdomainfriendly+'" data-fpdomain="'+bkg.getDomain(fpitemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="rfp_'+fpitemdomainfriendly+'"></span><span class="domainoutput">'+fpitemdomain+'</span> (<span rel="fpcount_'+fpitemdomainfriendly+'">1</span>)</span><br /><span class="choices fpchoices" rel="'+fpitemdomain+'" sn_list="'+itemdomain+'"><span style="display: none;" class="box box4 fp_'+fpitemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
												$('#blocked .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"]').attr("title",$('#blocked .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"]').attr("title")+"\r\n["+response.blockeditems[i][1]+"] "+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&")));
												$('#blocked .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem [rel="fpcount_'+fpitemdomainfriendly+'"]').html((parseInt($("#blocked .fpcat[rel='x_"+itemdomainfriendly+"'] .fpitem [rel='fpcount_"+fpitemdomainfriendly+"']").html())+1));
												$("#blocked .fpcat[rel='x_"+itemdomainfriendly+"'] [rel='count_"+itemdomainfriendly+"']").html((parseInt($("#blocked .fpcat[rel='x_"+itemdomainfriendly+"'] [rel='count_"+itemdomainfriendly+"']").html())+1));
											}
											$("#blocked [rel='x_"+itemdomainfriendly+"'] .fp_"+fpitemdomainfriendly).bind("click", x_removehandle);
										} else {
											$("#blocked").append('<div class="thirditem" title="['+response.blockeditems[i][1]+'] '+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="r_'+itemdomainfriendly+'"></span><span class="domainoutput">'+itemdomain+'</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span><br /><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</span><span class="box box2 x_blacklist" rel="1" title="Deny">'+bkg.getLocale("deny")+'</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
											$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).hide();
										}
									}
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).bind("click", x_removehandle);
								} else {
									$("#blocked [rel='x_"+itemdomainfriendly+"']").attr("title",$("#blocked [rel='x_"+itemdomainfriendly+"']").attr("title")+"\r\n["+response.blockeditems[i][1]+"] "+$.trim(response.blockeditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&")));
									$("#blocked [rel='count_"+itemdomainfriendly+"']").html((parseInt($("#blocked [rel='count_"+itemdomainfriendly+"']").html())+1));
								}
								if (response.rating == 'true') {
									$("#blocked [rel='r_"+itemdomainfriendly+"']").html('<span class="wot"><a href="http://www.mywot.com/en/scorecard/'+itemdomain.replace(/[\[\]]/g,"")+'" target="_blank" title="'+bkg.getLocale("ratingbtn")+': '+itemdomain+'"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></a></span>');
									if (response.blockeditems[i][6]) $('#blocked [rel="rfp_'+fpitemdomainfriendly+'"]').html('<span class="wot"><a href="http://www.mywot.com/en/scorecard/'+fpitemdomain.replace(/[\[\]]/g,"")+'" target="_blank" title="'+bkg.getLocale("ratingbtn")+': '+fpitemdomain+'"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></a></span>');
								}
								if ((response.annoyances == 'true' && response.annoyancesmode == 'strict' && domainCheckStatus == '-1' && baddiesstatus == '1') || (response.antisocial == 'true' && baddiesstatus == '2')) {
									$("#blocked").append($("#blocked [rel='x_"+itemdomainfriendly+"']"));
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .box1, #blocked [rel='x_"+itemdomainfriendly+"'] .x_trust, #blocked [rel='x_"+itemdomainfriendly+"'] .box3, #blocked [rel='x_"+itemdomainfriendly+"'] .box4").hide();
									if (response.antisocial == 'true' && baddiesstatus == '2') {
										$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_blacklist").attr("title","Antisocial").html(bkg.getLocale("antisocialpopup")).addClass("selected");
									} else {
										$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_blacklist").attr("title","Unwanted Content Provider").html(bkg.getLocale("unwanted")).addClass("selected");
									}
								} else if ((parentstatus == '1' || parentstatus == '-1') && domainCheckStatus == '0') {
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .box1, #blocked [rel='x_"+itemdomainfriendly+"'] .x_trust, #blocked [rel='x_"+itemdomainfriendly+"'] .box3, #blocked [rel='x_"+itemdomainfriendly+"'] .box4").hide();
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_blacklist").attr("title","Ignored allowed domain due to unlisted tab domain").html(bkg.getLocale("ignoredallow")).addClass("selected");
								} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesstatus == '1') {
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).hide();
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_blacklist").attr("title","Unwanted Content Provider").html(bkg.getLocale("unwanted")).addClass("selected");
								} else if (itemdomain[0] == '[' || itemdomain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) {
									$("#blocked [rel='x_"+itemdomainfriendly+"'] .x_trust").hide();
								}
								if (mode == 'allow') {
									if (bkg.in_array(itemdomain, response.temp)) {
										if (!intemp) intemp = true;
										$("#blocked .thirditem[rel='x_"+itemdomainfriendly+"'] .x_blacklist").removeClass("selected");
										$("#blocked .thirditem[rel='x_"+itemdomainfriendly+"'] .x_bypass").addClass("selected");
										$("#blocked .thirditem[rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).hide();
									} else {
										$("#blocked .thirditem[rel='x_"+itemdomainfriendly+"'] .x_bypass").hide();
									}
								}
							}
						}
						$("#blocked").append($('.thirditem:has([title="Ignored allowed domain due to unlisted tab domain"])'));
						$("#blocked").append($('.thirditem:has([title="Unwanted Content Provider"])'));
						$("#blocked").append($('.thirditem:has([title="Antisocial"])'));
						$("#blocked").append($('.thirditem:not(*>:has(.choices))'));
						$("#blocked").append($("#blocked [rel='x_no_script']"));
						$("#blocked").append($("#blocked [rel='x_web_bug']"));
						$("#blocked").append($("#blocked [rel='x_data_url']"));
						$("#blocked").append($("#blocked [rel='x_spoofed_timezone']"));
						$("#blocked").append($("#blocked [rel='x_canvas_fingerprint']"));
						$("#blocked").append($("#blocked [rel='x_canvas_font_access']"));
						$("#blocked").append($("#blocked [rel='x_battery_fingerprint']"));
						$("#blocked").append($("#blocked [rel='x_audio_fingerprint']"));
						$("#blocked").append($("#blocked [rel='x_webgl_fingerprint']"));
						$("#blocked").append($("#blocked [rel='x_device_enumeration']"));
						$("#blocked").append($("#blocked [rel='x_gamepad_enumeration']"));
						$("#blocked").append($("#blocked [rel='x_webvr_enumeration']"));
						$("#blocked").append($("#blocked [rel='x_bluetooth_enumeration']"));
						$("#blocked").append($("#blocked [rel='x_client_rectangles']"));
						$("#blocked").append($("#blocked [rel='x_clipboard_interference']"));
						$("#blocked").append($("#blocked [rel='x_browser_plugins_enumeration']"));
						$("#blocked").prepend($("#blocked [data-domain='"+tabdomainroot+"'][data-baddie='false']"));
						$("#blocked [rel='x_"+tabdomainfriendly+"']").children().first().css("font-weight", "bold");
						$("#blocked [rel='fp_"+tabdomainfriendly+"']").children().css("font-weight", "bold");
						$("#blocked").prepend($("#blocked [rel='x_"+tabdomainfriendly+"']"));
					}
					if (responseAllowedCount != 0) {
						if (response.domainsort == 'true') response.alloweditems = bkg.domainSort(response.alloweditems);
						else response.alloweditems.sort();
						$(".thirds").parent().parent().append("<tr><td class='bolded' style='height: 14px;'><span class='allowed'>"+bkg.getLocale("alloweditems")+"</span></td></tr><tr><td class='thirds' id='allowed'></td></tr>");
						for (var i=0;i<responseAllowedCount;i++) {
							var itemdomain = response.alloweditems[i][2];
							var fpitemdomain = response.alloweditems[i][2];
							if (response.alloweditems[i][1] == 'Canvas Fingerprint') itemdomain = 'canvas.fingerprint';
							else if (response.alloweditems[i][1] == 'Canvas Font Access') itemdomain = 'canvas.font.access';
							else if (response.alloweditems[i][1] == 'Audio Fingerprint') itemdomain = 'audio.fingerprint';
							else if (response.alloweditems[i][1] == 'WebGL Fingerprint') itemdomain = 'webgl.fingerprint';
							else if (response.alloweditems[i][1] == 'Battery Fingerprint') itemdomain = 'battery.fingerprint';
							else if (response.alloweditems[i][1] == 'Device Enumeration') itemdomain = 'device.enumeration';
							else if (response.alloweditems[i][1] == 'Gamepad Enumeration') itemdomain = 'gamepad.enumeration';
							else if (response.alloweditems[i][1] == 'WebVR Enumeration') itemdomain = 'webvr.enumeration';
							else if (response.alloweditems[i][1] == 'Bluetooth Enumeration') itemdomain = 'bluetooth.enumeration';
							else if (response.alloweditems[i][1] == 'Client Rectangles') itemdomain = 'client.rectangles';
							else if (response.alloweditems[i][1] == 'Clipboard Interference') itemdomain = 'clipboard.interference';
							else if (response.alloweditems[i][1] == 'Browser Plugins Enumeration') itemdomain = 'browser.plugins.enumeration';
							if (itemdomain) {
								allowed.push(itemdomain);
								var itemdomainfriendly = itemdomain.replace(/[.\[\]:]/g,"_");
								var fpitemdomainfriendly = fpitemdomain.replace(/[.\[\]:]/g,"_");
								var baddiesstatus = response.alloweditems[i][4];
								if ($('#allowed .thirditem[rel="x_'+itemdomainfriendly+'"]').length == 0) {
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
										$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="r_'+itemdomainfriendly+'"></span><span class="domainoutput">'+itemdomain+'</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span><br /><span class="choices" rel="'+itemdomain+'" sn_list="'+allowedtype+'"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist selected" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box1 x_trust'+trustval0+'" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</span><span class="box box2 x_blacklist" rel="1" title="Deny">'+bkg.getLocale("deny")+'</span><span class="box box2 x_trust'+trustval1+'" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
										$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).bind("click", x_removehandle);
									} else {
										if (response.alloweditems[i][5]) {
											if ($('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"]').length == 0) {
												$("#allowed").append('<div class="fpcat" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><div class="fphead">'+response.alloweditems[i][1]+'<span class="chevron"></span></div><div class="fpoptions details_'+itemdomainfriendly+'"><div class="fpitem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="fp_'+fpitemdomainfriendly+'" data-fpdomain="'+bkg.getDomain(fpitemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="rfp_'+fpitemdomainfriendly+'"></span><span class="domainoutput">'+fpitemdomain+'</span></span><br /><span class="choices fpchoices" rel="'+fpitemdomain+'" sn_list="'+itemdomain+'"><span style="display: none;" class="box box4 fp_'+fpitemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div></div></div>');
											} else {
												if ($('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"]').length == 0) $("#allowed .fpcat[rel='x_"+itemdomainfriendly+"'] .fpoptions").append('<div class="fpitem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="fp_'+fpitemdomainfriendly+'" data-fpdomain="'+bkg.getDomain(fpitemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="rfp_'+fpitemdomainfriendly+'"></span><span class="domainoutput">'+fpitemdomain+'</span></span><br /><span class="choices fpchoices" rel="'+fpitemdomain+'" sn_list="'+itemdomain+'"><span style="display: none;" class="box box4 fp_'+fpitemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
											}
										} else {
											$("#allowed").append('<div class="thirditem" title="['+response.alloweditems[i][1]+'] '+$.trim(response.alloweditems[i][0].replace(/"/g, "'").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&amp;/g, "&"))+'" rel="x_'+itemdomainfriendly+'" data-domain="'+bkg.getDomain(itemdomain)+'" data-baddie="'+baddiesstatus+'"><span><span rel="r_'+itemdomainfriendly+'"></span><span class="domainoutput">'+itemdomain+'</span> (<span rel="count_'+itemdomainfriendly+'">1</span>)</span><br /><span class="choices" rel="'+itemdomain+'" sn_list="-1"><span class="box box4 x_'+itemdomainfriendly+'" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span><span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</span><span class="box box2 x_blacklist" rel="1" title="Deny">'+bkg.getLocale("deny")+'</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></span></div>');
											$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).hide();
										}
									}
								} else {
									$("#allowed [rel='x_"+itemdomainfriendly+"']").attr("title",$("#allowed [rel='x_"+itemdomainfriendly+"']").attr("title")+"\r\n["+response.alloweditems[i][1]+"] "+response.alloweditems[i][0]);
									$("#allowed [rel='count_"+itemdomainfriendly+"']").html((parseInt($("#allowed [rel='count_"+itemdomainfriendly+"']").html())+1));
								}
								if (response.rating == 'true') {
									$("#allowed [rel='r_"+itemdomainfriendly+"']").html('<span class="wot"><a href="http://www.mywot.com/en/scorecard/'+itemdomain.replace(/[\[\]]/g,"")+'" target="_blank" title="'+bkg.getLocale("ratingbtn")+': '+itemdomain+'"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></a></span>');
									if (response.alloweditems[i][5]) $('#allowed [rel="rfp_'+fpitemdomainfriendly+'"]').html('<span class="wot"><a href="http://www.mywot.com/en/scorecard/'+fpitemdomain.replace(/[\[\]]/g,"")+'" target="_blank" title="'+bkg.getLocale("ratingbtn")+': '+fpitemdomain+'"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></a></span>');
								}
								if (response.annoyances == 'true' && baddiesstatus == '1') {
									$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_blacklist").attr("title","Unwanted Content Provider").html(bkg.getLocale("unwanted"));
								} else if (itemdomain[0] == '[' || itemdomain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) {
									$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_trust").hide();
								}
								if (mode == 'block') {
									if (bkg.in_array(itemdomain, response.temp)) {
										if (!intemp) intemp = true;
										$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_whitelist").removeClass("selected");
										$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_bypass").addClass("selected");
										$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_"+itemdomainfriendly).hide();
									} else {
										$("#allowed [rel='x_"+itemdomainfriendly+"'] .x_bypass").hide();
									}
								}
								if (response.alloweditems[i][5]) {
									if (response.alloweditems[i][3] == '2') $('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"] .x_bypass').addClass('selected').show();
									else if (response.alloweditems[i][3] == '1') {
										$('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"] .x_whitelist').addClass('selected').show();
										$('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"] .box4').show();
									}
									$('#allowed .fpcat[rel="x_'+itemdomainfriendly+'"] .fpitem[rel="fp_'+fpitemdomainfriendly+'"] .box4').bind("click", x_removehandle);
								}
							}
						}
						$("#allowed").prepend($("#allowed [data-domain='"+tabdomainroot+"'][data-baddie='false']"));
						$("#allowed [rel='x_"+tabdomainfriendly+"']").children().first().css("font-weight", "bold");
						$("#allowed [rel='fp_"+tabdomainfriendly+"']").children().css("font-weight", "bold");
						$("#allowed").prepend($("#allowed [rel='x_"+tabdomainfriendly+"']"));
						$("#allowed").append($("#allowed [rel='x_canvas_fingerprint']"));
						$("#allowed").append($("#allowed [rel='x_canvas_font_access']"));
						$("#allowed").append($("#allowed [rel='x_battery_fingerprint']"));
						$("#allowed").append($("#allowed [rel='x_audio_fingerprint']"));
						$("#allowed").append($("#allowed [rel='x_webgl_fingerprint']"));
						$("#allowed").append($("#allowed [rel='x_device_enumeration']"));
						$("#allowed").append($("#allowed [rel='x_gamepad_enumeration']"));
						$("#allowed").append($("#allowed [rel='x_webvr_enumeration']"));
						$("#allowed").append($("#allowed [rel='x_bluetooth_enumeration']"));
						$("#allowed").append($("#allowed [rel='x_client_rectangles']"));
						$("#allowed").append($("#allowed [rel='x_clipboard_interference']"));
						$("#allowed").append($("#allowed [rel='x_browser_plugins_enumeration']"));
					}
					var blockedCount = blocked.length;
					var allowedCount = allowed.length;
					if (responseBlockedCount != 0 && blockedCount == 0) $(".thirds:first").html('<i>None</i>');
					if (responseAllowedCount != 0 && allowedCount == 0) $(".allowed").parent().hide();
					if (blockedCount != 0 && allowedCount != 0) {
						$(".allowed").parent().css('padding-top', '12px');
					}
					$(".x_whitelist,.x_blacklist,.x_trust,.x_bypass").bind("click", x_savehandle);
					var tempSel;
					if (responseAllowedCount == 0) tempSel = '.thirds';
					else tempSel = '#allowed';
					if (mode == 'block') {
						if ($('#blocked .thirditem').length == 1 && ($('#blocked .thirditem[rel="x_no_script"]').length == 1 || $('#blocked .thirditem[rel="x_web_bug"]').length == 1 || $('#blocked .thirditem[rel="x_canvas_fingerprint"]').length == 1 || $('#blocked .thirditem[rel="x_canvas_font_access"]').length == 1 || $('#blocked .thirditem[rel="x_audio_fingerprint"]').length == 1 || $('#blocked .thirditem[rel="x_webgl_fingerprint"]').length == 1 || $('#blocked .thirditem[rel="x_battery_fingerprint"]').length == 1 || $('#blocked .thirditem[rel="x_device_enumeration"]').length == 1 || $('#blocked .thirditem[rel="x_gamepad_enumeration"]').length == 1 || $('#blocked .thirditem[rel="x_webvr_enumeration"]').length == 1 || $('#blocked .thirditem[rel="x_bluetooth_enumeration"]').length == 1) || $('#blocked .thirditem[rel="x_spoofed_timezone"]').length == 1 || $('#blocked .thirditem[rel="x_client_rectangles"]').length == 1 || $('#blocked .thirditem[rel="x_clipboard_interference"]').length == 1 || $('#blocked .thirditem[rel="x_data_url"]').length == 1 || $('#blocked .thirditem[rel="x_browser_plugins_enumeration"]').length == 1) {
							// empty space
						} else {
							if ($("#blocked .x_whitelist:visible").length != 0) {
								$(tempSel).append('<br /><div class="box box3 allowsession" title="Allow all blocked items for the session (not including webbugs/noscript/fingerprinting/annoyances)">'+bkg.getLocale("allowallblocked")+'</div>');
							} else {
								$(tempSel).append('<br />');
							}
						}
					} else {
						$(tempSel).append('<br /><div class="box box3 allowsession" title="Block all allowed items for the session">'+bkg.getLocale("blockallallowed")+'</div>');
					}
					$(".allowsession").bind("click", bulkhandle);
					if (intemp || tabInTemp) {
						if ($(tempSel+' > br').length == 0) $(tempSel).append('<br />');
						$(tempSel).append('<div class="box box5 prevoke" title="Revoke temporary permissions given to the current page">'+bkg.getLocale("revoketemp")+'</div>');
						$(".prevoke").bind("click", bulkhandle);
					}
				}
				if (typeof response.temp !== 'undefined' && response.temp.length || (typeof response.tempfp !== 'undefined' && response.tempfp)) {
					if ($(tempSel+' > br').length == 0) $(tempSel).append('<br />');
					$(tempSel).append('<div class="box box5 clearglobaltemp" title="Revoke all temporary permissions given in this entire browsing session">'+bkg.getLocale("revoketempall")+'</div>');
					$(".clearglobaltemp").bind("click", revokealltemp);
				} else if ($(tempSel+' > br').length == 1 && $(tempSel+' > div.allowsession').length == 0) $(tempSel+' > br').remove();
				$("#parent").prepend('<div class="box box4 pclear" title="Clear Domain from List">'+bkg.getLocale("clear")+'</div><div class="box box1 pallow" rel="0" title="Allow Current Domain">'+bkg.getLocale("allow")+'</div><div class="box box1 ptrust" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</div><div class="box box2 pdeny" rel="1" title="Deny">'+bkg.getLocale("deny")+'</div><div class="box box2 ptrust" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</div><div class="box box3 pbypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</div>').attr("sn_list",response.enable);
				$(".pallow,.pdeny,.pbypass,.ptrust").bind("click", savehandle);
				$(".pclear").bind("click", removehandle).hide();
				if (tabdomain[0] == '[' || tabdomain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) $(".ptrust").hide();
				if (response.enable == '1' || response.enable == '4') {
					if (tabInTemp) {
						$(".pbypass, #blocked [rel='x_"+tabdomainfriendly+"'] .x_bypass").addClass('selected');
						$("#blocked [rel='x_"+tabdomainfriendly+"'] .x_blacklist").removeClass('selected').bind("click", x_savehandle);
						$("#blocked .x_"+tabdomainfriendly).hide();
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
							$(".pdeny").addClass("selected").attr("title","Blocked (antisocial)").text(bkg.getLocale("antisocialpopup"));
						} else {
							$(".pdeny").addClass("selected").attr("title","Blocked (provider of unwanted content)").text(bkg.getLocale("blocked"));
						}
						$(".pbypass, .ptrust[rel='3'], .ptrust[rel='4'], .pclear, .pallow").hide();
					} else if (response.annoyances == 'true' && domainCheckStatus == '-1' && baddiesStatus == 1) {
						$(".pdeny").addClass("selected").attr("title","Blocked (provider of unwanted content)").text(bkg.getLocale("blocked"));
						$(".pbypass").show();
						$(".pclear").hide();
					}
				} else if (response.enable == '0' || response.enable == '3') {
					if (tabInTemp) {
						$(".pbypass, #allowed [rel='x_"+tabdomainfriendly+"'] .x_bypass").addClass('selected');
						$("#allowed [rel='x_"+tabdomainfriendly+"'] .x_whitelist").removeClass('selected').bind("click", x_savehandle);
						$("#allowed .x_"+tabdomainfriendly).hide();
					} else {
						$(".pbypass").hide();
						$(".pclear").show();
						$(".pallow").addClass("selected");
						if (response.enable == '3') $(".ptrust[rel='3']").addClass("selected");
					}
				}
				if (response.status == 'true') $("#credit").append('&nbsp;|&nbsp;<span class="box box2 snstatus" title="Disable ScriptSafe">'+bkg.getLocale("disable")+'</span>');
				$(".snstatus").bind("click", statuschange);
				$(".fphead").bind("click", function() {
					$(this).next().toggle();
					if ($('.chevron', this).hasClass('uparrow')) $('.chevron', this).removeClass('uparrow');
					else $('.chevron', this).addClass('uparrow');
				});
				closepage = response.closepage;
				if (response.rating == 'true') {
					$(".wot a").click(function() {
						chrome.tabs.create({url: $(this).attr('href'), active: false});
						return false;
					});
				}
			});
		}
	});
}
function bulk(el) {
	var urlarray;
	if (el.hasClass("prevoke")) {
		if (mode == 'block') urlarray = allowed;
		else urlarray = blocked;
		chrome.runtime.sendMessage({reqtype: "remove-temp", url: urlarray});
	} else {
		if (mode == 'block') urlarray = blocked;
		else urlarray = allowed;
		chrome.runtime.sendMessage({reqtype: "temp", url: urlarray, mode: mode});
	}
	window.close();
}
function remove(url, el, type) {
	var val = el.attr("rel");
	var selected = el.hasClass("selected");
	if (val != 2 && selected) return;
	port.postMessage({url: taburl, tid: tabid});
	if (el.parent().hasClass("fpchoices")) {
		var fpType = el.parent().attr("sn_list");
		var fpList;
		if (fpType == 'canvas.fingerprint') fpList = 'fpCanvas';
		else if (fpType == 'canvas.font.access') fpList = 'fpCanvasFont';
		else if (fpType == 'audio.fingerprint') fpList = 'fpAudio';
		else if (fpType == 'webgl.fingerprint') fpList = 'fpWebGL';
		else if (fpType == 'battery.fingerprint') fpList = 'fpBattery';
		else if (fpType == 'device.enumeration') fpList = 'fpDevice';
		else if (fpType == 'gamepad.enumeration') fpList = 'fpGamepad';
		else if (fpType == 'webvr.enumeration') fpList = 'fpWebVR';
		else if (fpType == 'bluetooth.enumeration') fpList = 'fpBluetooth';
		else if (fpType == 'client.rectangles') fpList = 'fpClientRectangles';
		else if (fpType == 'clipboard.interference') fpList = 'fpClipboard';
		else if (fpType == 'browser.plugins.enumeration') fpList = 'fpBrowserPlugins';
		bkg.fpDomainHandler('**.'+bkg.getDomain(url), fpList, -1);
		bkg.fpDomainHandler(url, fpList, -1);
	} else {
		var trustType = bkg.trustCheck(url);
		if (trustType) {
			bkg.domainHandler('**.'+bkg.getDomain(url), 2);
			bkg.domainHandler('**.'+bkg.getDomain(url), 2, 1);
		} else {
			bkg.domainHandler(url, 2);
			bkg.domainHandler(url, 2, 1);
		}
	}
	bkg.triggerUpdated();
	chrome.runtime.sendMessage({reqtype: "refresh-page-icon", tid: tabid, type: 1});
	if (closepage == 'true') window.close();
	else {
		var urlfriendly = url.replace(/[.\[\]:]/g,"_");
		if (el.parent().attr("sn_list") == '0' || el.parent().attr("sn_list") == '3') {
			$(".thirditem[rel='x_"+urlfriendly+"'] .choices, #parent").attr("sn_list", "-1");
		}
		el.hide();
		if (type == '0') {
			$(".thirditem .x_"+urlfriendly).parent().children().removeClass("selected");
			$(".thirditem .x_"+urlfriendly).hide();
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
			if ($(".thirditem[rel='x_"+urlfriendly+"'] .x_blacklist").text() == 'Unwanted') $(".thirditem[rel='x_"+urlfriendly+"'] .x_blacklist").addClass("selected");
			$(".pbypass").show();
			$(".thirditem[rel='x_"+urlfriendly+"'] .x_bypass").show();
		} else if (type == '1') {
			if (!el.parent().hasClass("fpchoices")) {
				if (url == tabdomain) {
					$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
					$(".pbypass").show();
					$('.pclear').hide();
				}
			}
			$(".x_bypass", el.parent()).show();
			el.parent().children().removeClass("selected");
			if ($(".x_blacklist", el.parent()).text() == 'Unwanted') $(".x_blacklist", el.parent()).addClass("selected");
		}
	}
}
function save(url, el, type) {
	var val = el.attr("rel");
	var selected = el.hasClass("selected");
	if (val != 2 && selected) return;
	if (el.parent().hasClass("fpchoices")) {
		var fpType = el.parent().attr("sn_list");
		var fpList;
		if (fpType == 'canvas.fingerprint') fpList = 'fpCanvas';
		else if (fpType == 'canvas.font.access') fpList = 'fpCanvasFont';
		else if (fpType == 'audio.fingerprint') fpList = 'fpAudio';
		else if (fpType == 'webgl.fingerprint') fpList = 'fpWebGL';
		else if (fpType == 'battery.fingerprint') fpList = 'fpBattery';
		else if (fpType == 'device.enumeration') fpList = 'fpDevice';
		else if (fpType == 'gamepad.enumeration') fpList = 'fpGamepad';
		else if (fpType == 'webvr.enumeration') fpList = 'fpWebVR';
		else if (fpType == 'bluetooth.enumeration') fpList = 'fpBluetooth';
		else if (fpType == 'client.rectangles') fpList = 'fpClientRectangles';
		else if (fpType == 'clipboard.interference') fpList = 'fpClipboard';
		else if (fpType == 'browser.plugins.enumeration') fpList = 'fpBrowserPlugins';
		if (val < 2) {
			bkg.fpDomainHandler(url, fpList, -1, 1);
			chrome.runtime.sendMessage({reqtype: "save-fp", url: url, list: fpList});
		} else if (val == 2) {
			if (selected) chrome.runtime.sendMessage({reqtype: "remove-temp-fp", url: url, list: fpList});
			else chrome.runtime.sendMessage({reqtype: "temp-fp", url: url, list: fpList});
		} else if (val == 3) {
			bkg.topHandler(url, fpList);
			val = 0;
		}
	} else {
		if (val < 2) {
			bkg.domainHandler(url, '2', '1');
			chrome.runtime.sendMessage({reqtype: "save", url: url, list: val});
		} else if (val == 2) {
			if (selected) chrome.runtime.sendMessage({reqtype: "remove-temp", url: url});
			else chrome.runtime.sendMessage({reqtype: "temp", url: url, mode: mode});
		} else if (val == 3) {
			bkg.topHandler(url, 0);
			val = 0;
		} else if (val == 4) {
			bkg.topHandler(url, 1);
			val = 1;
		}
	}
	if (val != 2) bkg.triggerUpdated();
	if (url == tabdomain) chrome.runtime.sendMessage({reqtype: "refresh-page-icon", tid: tabid, type: val});
	if (closepage == 'true') window.close();
	else {
		var urlfriendly = url.replace(/[.\[\]:]/g,"_");
		if (type == '0') {
			$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
			$(".thirditem[rel='x_"+urlfriendly+"'] .choices").children().removeClass("selected");
			$(".thirditem .x_"+urlfriendly).hide();
			if (val == 0) $(".thirditem[rel='x_"+urlfriendly+"'] .x_whitelist").addClass('selected');
			else if (val == 1) $(".thirditem[rel='x_"+urlfriendly+"'] .x_blacklist").addClass('selected');
			else if (val == 2) $(".thirditem[rel='x_"+urlfriendly+"'] .x_bypass").addClass('selected');
			$(".pclear").hide();
			if (el.attr("rel") == '3') {
				$(".pallow, .thirditem[rel='x_"+urlfriendly+"'] .x_trust[rel='3']").addClass('selected');
			} else if (el.attr("rel") == '4') {
				$(".pdeny, .thirditem[rel='x_"+urlfriendly+"'] .x_trust[rel='4']").addClass('selected');
			}
			if (val < 2) {
				$(".pbypass, .thirditem[rel='x_"+urlfriendly+"'] .x_bypass").hide();
				$(".thirditem .x_"+urlfriendly+", .pclear").show();
				el.addClass('selected');
			} else {
				if (!selected) {
					el.addClass('selected');
					$(".thirditem[rel='x_"+urlfriendly+"'] .x_bypass").addClass('selected');
				} else {
					$(".thirditem[rel='x_"+urlfriendly+"'] .x_bypass").removeClass('selected');
				}
			}
		} else if (type == '1') {
			el.parent().children().removeClass("selected");
			if (!el.parent().hasClass("fpchoices")) $(".x_"+urlfriendly).hide();
			if (url == tabdomain) {
				if (!el.parent().hasClass("fpchoices")) {
					$(".pallow,.pdeny,.pbypass,.ptrust").removeClass("selected");
					$(".pclear").hide();
					if (val == 0) $(".pallow").addClass('selected');
					else if (val == 1) $(".pdeny").addClass('selected');
				}
				if (el.attr("rel") == '3') {
					if (!el.parent().hasClass("fpchoices")) $(".ptrust[rel='3']").addClass('selected');
					$(".x_whitelist", el.parent()).addClass('selected');
				} else if (el.attr("rel") == '4') {
					$(".ptrust[rel='4']").addClass('selected');
					$(".x_blacklist", el.parent()).addClass('selected');
				}
			}
			if (val < 2) {
				if (url == tabdomain) {
					if (!el.parent().hasClass("fpchoices")) {
						$(".pclear").show();
						$(".pbypass").hide();
					}
				} else {
					if (el.attr("rel") == '3') $(".x_whitelist", el.parent()).addClass('selected');
					else if (el.attr("rel") == '4') $(".x_blacklist", el.parent()).addClass('selected');
				}
				el.addClass('selected');
				if (!el.parent().hasClass("fpchoices")) $(".x_"+urlfriendly).show();
				if (el.parent().hasClass("fpchoices")) $(".fp_"+urlfriendly).show();
				$(".x_bypass", el.parent()).hide();
			} else {
				if (!selected) {
					el.addClass('selected');
					if (url == tabdomain && !el.parent().hasClass("fpchoices")) $(".pbypass").addClass('selected').show();
				} else {
					if (url == tabdomain && !el.parent().hasClass("fpchoices")) $(".pbypass").removeClass('selected').show();
					if ($(".x_blacklist", el.parent()).text() == 'Unwanted') $(".x_blacklist", el.parent()).addClass("selected");
				}
				$(".x_bypass", el.parent()).show();
			}
		}
	}
	selected = false;
}