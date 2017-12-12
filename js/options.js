// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
'use strict';
var version = '1.0.9.3';
var bkg = chrome.extension.getBackgroundPage();
var settingnames = [];
var syncstatus;
document.addEventListener('DOMContentLoaded', function () {
	initTabs();
	i18load();
	loadOptions();
	var langs = bkg.getLangs();
	$.each(langs, function(i, v) {
		$("#locale").append('<option value="'+i+'">'+v+'</option>');
	});
	$("#locale").val(localStorage['locale']).change(saveLang);
	$(".save").click(saveOptions);
	$("#keydelta").blur(function() {
		if ($(this).val() < 0 || isNaN(parseInt($(this).val()))) {
			$(this).val(40); saveElement("keydelta");
		} 
	});
	$("#domainsort").click(domainsort);
	$("#whitebind").click(whitelistlisten);
	$(".fpAdd").click(addFPList);
	$("#blackbind").click(blacklistlisten);
	$("#whiteclear").click(whiteclear);
	$("#blackclear").click(blackclear);
	$("#importwhite").click(importwhite);
	$("#importblack").click(importblack);
	$("#domaininfo").click(function() {
		$("#domaininfocontainer").slideToggle('slow');
	});
	$("#hideimport").click(hidebulk);
	$("#importsettings").click(settingsImport);
	$("#settingsall").click(settingsall);
	$("#syncenable").change(function() {
		if ($(this).prop('checked') && confirm(bkg.getLocale("forcesyncimport"))) {
			bkg.importSyncHandle(1);
		}
	});
	$(".savechange").change(saveOptions);
	$(".closepage").click(closeOptions);
	$("#syncimport").click(forceSyncImport);
	$("#syncexport").click(forceSyncExport);
	$("#savetxt").click(downloadtxt);
	$("#viewtoggle").click(function() {
		viewToggle(1);
	});
	$("#hotkeyspage").click(function() {
		chrome.tabs.create({url: 'chrome://extensions/?id=footer-section'});
	});
	$("#restoredefault").click(function() {
		if (confirm(bkg.getLocale("restoredefaultconfirm"))) {
			bkg.setDefaultOptions(1);
			notification(bkg.getLocale("settingssave"));
		}
	});
	$("#restoredefault2").click(function() {
		if (confirm(bkg.getLocale("restoredefaultconfirm2"))) {
			bkg.setDefaultOptions(2);
			notification(bkg.getLocale("settingssave"));
		}
	});
	$("#useragent").keyup(function() {
		if ($(this).val().indexOf("\n") != -1) $(".useragentrandom").show();
		else $(".useragentrandom").hide();
	});
	syncstatus = localStorage['syncenable'];
	$(".row-offcanvas").show();
	if (localStorage['optionslist'] == 'true') viewToggle(0);
	$('#sidebar').stickyScroll({ container: '#sectionname' });
	bkg.setUpdated();
	setInterval(function() { if (bkg.getUpdated()) { bkg.setUpdated(); window.location.reload(1); } }, 5000);
});
function i18load() {
	$(".i18_support").html(bkg.getLocale("support"));
	$("#restoredefault").val(bkg.getLocale("restoredefault"));
	$("#restoredefault2").val(bkg.getLocale("restoredefault2"));
	$(".i18_listallsettings").html(bkg.getLocale("listallsettings"));
	$(".i18_groupallsettings").html(bkg.getLocale("groupallsettings"));
	$(".i18_sections").html(bkg.getLocale("sections"));
	$(".i18_save").val(bkg.getLocale("save"));
	$(".i18_close").val(bkg.getLocale("close"));
	$(".i18_enable").html(bkg.getLocale("enable"));
	$(".i18_mode").html(bkg.getLocale("mode"));
	$(".i18_default").html(bkg.getLocale("default"));
	$(".i18_enabled").html(bkg.getLocale("enabled"));
	$(".i18_disabled").html(bkg.getLocale("disabled"));
	$(".i18_enablesyncing").html(bkg.getLocale("enablesyncing"));
	$("#syncimport").val(bkg.getLocale("syncimport"));
	$("#syncexport").val(bkg.getLocale("syncexport"));
	$(".i18_blockrec").html(bkg.getLocale("blockrec"));
	$(".i18_block").html(bkg.getLocale("block"));
	$(".i18_allow").html(bkg.getLocale("allow"));
	$(".i18_disableremove").html(bkg.getLocale("disableremove"));
	$(".i18_xml").html(bkg.getLocale("xml"));
	$(".i18_disabledcap").html(bkg.getLocale("disabledcap"));
	$(".i18_xmlcross").html(bkg.getLocale("xmlcross"));
	$(".i18_xmlall").html(bkg.getLocale("xmlall"));
	$(".i18_xmldesc").html(bkg.getLocale("xmldesc"));
	$(".i18_syncnotify").html(bkg.getLocale("syncnotify"));
	$(".i18_syncnotifydesc").html(bkg.getLocale("syncnotifydesc"));
	$(".i18_syncfromnotify").html(bkg.getLocale("syncfromnotify"));
	$(".i18_syncfromnotifydesc").html(bkg.getLocale("syncfromnotifydesc"));
	$(".i18_updatenotify").html(bkg.getLocale("updatenotify"));
	$(".i18_updatenotifydesc").html(bkg.getLocale("updatenotifydesc"));
	$(".i18_hotkeys").html(bkg.getLocale("hotkeys"));
	$(".i18_availablehotkeys").html(bkg.getLocale("availablehotkeys"));
	$(".i18_hotkeystoggle").html(bkg.getLocale("hotkeystoggle"));
	$(".i18_hotkeysremove").html(bkg.getLocale("hotkeysremove"));
	$(".i18_hotkeysremoveall").html(bkg.getLocale("hotkeysremoveall"));
	$("#hotkeyspage").html(bkg.getLocale("hotkeyspage"));
	$(".i18_showcontext").html(bkg.getLocale("showcontext"));
	$(".i18_hotkeysinst").html(bkg.getLocale("hotkeysinst"));
	$(".i18_canvas").html(bkg.getLocale("canvas"));
	$(".i18_canvasblank").html(bkg.getLocale("canvasblank"));
	$(".i18_canvasrandom").html(bkg.getLocale("canvasrandom"));
	$(".i18_canvasblock").html(bkg.getLocale("canvasblock"));
	$(".i18_canvasdesc").html(bkg.getLocale("canvasdesc"));
	$(".i18_audioblock").html(bkg.getLocale("audioblock"));
	$(".i18_audioblockdesc").html(bkg.getLocale("audioblockdesc"));
	$(".i18_webgl").html(bkg.getLocale("webgl"));
	$(".i18_webgldesc").html(bkg.getLocale("webgldesc"));
	$(".i18_battery").html(bkg.getLocale("battery"));
	$(".i18_batterydesc").html(bkg.getLocale("batterydesc"));
	$(".i18_webrtcdevice").html(bkg.getLocale("webrtcdevice"));
	$(".i18_webrtcdevicedesc").html(bkg.getLocale("webrtcdevicedesc"));
	$(".i18_gamepad").html(bkg.getLocale("gamepad"));
	$(".i18_gamepaddesc").html(bkg.getLocale("gamepaddesc"));
	$(".i18_webvr").html(bkg.getLocale("webvr"));
	$(".i18_webvrdesc").html(bkg.getLocale("webvrdesc"));
	$(".i18_bluetooth").html(bkg.getLocale("bluetooth"));
	$(".i18_bluetoothdesc").html(bkg.getLocale("bluetoothdesc"));
	$(".i18_canvasfont").html(bkg.getLocale("canvasfont"));
	$(".i18_canvasfontdesc").html(bkg.getLocale("canvasfontdesc"));
	$(".i18_clientrects").html(bkg.getLocale("clientrects"));
	$(".i18_clientrectsdesc").html(bkg.getLocale("clientrectsdesc"));
	$(".i18_keyboard").html(bkg.getLocale("keyboard"));
	$(".i18_keyboarddesc").html(bkg.getLocale("keyboarddesc"));
	$(".i18_browserplugins").html(bkg.getLocale("browserplugins"));
	$(".i18_browserpluginsdesc").html(bkg.getLocale("browserpluginsdesc"));
	$(".i18_paranoia").html(bkg.getLocale("paranoia"));
	$(".i18_paranoiadesc").html(bkg.getLocale("paranoiadesc"));
	$(".i18_annoyances").html(bkg.getLocale("annoyances"));
	$(".i18_annoyancesdesc").html(bkg.getLocale("annoyancesdesc"));
	$(".i18_cookies").html(bkg.getLocale("cookies"));
	$(".i18_cookiesdesc").html(bkg.getLocale("cookiesdesc"));
	$(".i18_annoyancesmode").html(bkg.getLocale("annoyancesmode"));
	$(".i18_annoyancesmodedesc").html(bkg.getLocale("annoyancesmodedesc"));
	$(".i18_antisocial").html(bkg.getLocale("antisocial"));
	$(".i18_antisocialdesc").html(bkg.getLocale("antisocialdesc"));
	$(".i18_antisocialdesc2").html(bkg.getLocale("antisocialdesc2"));
	$(".i18_webbugs").html(bkg.getLocale("webbugs"));
	$(".i18_webbugsdesc").html(bkg.getLocale("webbugsdesc"));
	$(".i18_utm").html(bkg.getLocale("utm"));
	$(".i18_utmdesc").html(bkg.getLocale("utmdesc"));
	$(".i18_hashchecking").html(bkg.getLocale("hashchecking"));
	$(".i18_hashcheckingdesc").html(bkg.getLocale("hashcheckingdesc"));
	$(".i18_webrtc").html(bkg.getLocale("webrtc"));
	$(".i18_webrtcdesc").html(bkg.getLocale("webrtcdesc"));
	$(".i18_referrer").html(bkg.getLocale("referrer"));
	$(".i18_referrerdesc").html(bkg.getLocale("referrerdesc"));
	$(".i18_timezone").html(bkg.getLocale("timezone"));
	$(".i18_timezonedesc").html(bkg.getLocale("timezonedesc"));
	$(".i18_useragentspoof").html(bkg.getLocale("useragentspoof"));
	$(".i18_useragentspoofdesc").html(bkg.getLocale("useragentspoofdesc"));
	$(".i18_uaspoofallow").html(bkg.getLocale("uaspoofallow"));
	$(".i18_request").html(bkg.getLocale("request"));
	$(".i18_interval").html(bkg.getLocale("interval"));
	$(".i18_minutes").html(bkg.getLocale("minutes"));
	$(".i18_referrerspoof").html(bkg.getLocale("referrerspoof"));
	$(".i18_referrerspoofdesc").html(bkg.getLocale("referrerspoofdesc"));
	$("#userref").attr('placeholder', bkg.getLocale("userref"));
	$(".i18_linktarget").html(bkg.getLocale("linktarget"));
	$(".i18_linktargetdesc").html(bkg.getLocale("linktargetdesc"));
	$(".i18_preservesamedomain").html(bkg.getLocale("preservesamedomain"));
	$(".i18_preservesamedomaindesc").html(bkg.getLocale("preservesamedomaindesc"));
	$(".i18_refresh").html(bkg.getLocale("refresh"));
	$(".i18_refreshdesc").html(bkg.getLocale("refreshdesc"));
	$(".i18_rating").html(bkg.getLocale("rating"));
	$(".i18_ratingdesc").html(bkg.getLocale("ratingdesc"));
	$(".i18_classicoptions").html(bkg.getLocale("classicoptions"));
	$(".i18_classicoptionsdesc").html(bkg.getLocale("classicoptionsdesc"));
	$(".i18_clipboard").html(bkg.getLocale("clipboard"));
	$(".i18_clipboarddesc").html(bkg.getLocale("clipboarddesc"));
	$(".i18_domainsort").html(bkg.getLocale("domainsort"));
	$(".i18_domainsortdesc").html(bkg.getLocale("domainsortdesc"));
	$(".i18_url").html(bkg.getLocale("url"));
	$("#url").attr('placeholder', bkg.getLocale("urldesc"));
	$("#whitebind").val(bkg.getLocale("whitebind"));
	$("#blackbind").val(bkg.getLocale("blackbind"));
	$("#domaininfo").val(bkg.getLocale("domaininfo"));
	$(".i18_whitelist").html(bkg.getLocale("whitelist"));
	$(".i18_blacklist").html(bkg.getLocale("blacklist"));
	$("#blackclear, #whiteclear").html(bkg.getLocale("clearlow"));
	$("#importwhite, #importblack").html(bkg.getLocale("bulkimport"));
	$(".i18_bulkimportcap").html(bkg.getLocale("bulkimportcap"));
	$(".i18_bulkimportcapdesc").html(bkg.getLocale("bulkimportcapdesc"));
	$("#bulkbtn").html(bkg.getLocale("bulkbtn"));
	$("#hideimport").val(bkg.getLocale("hide"));
	$(".i18_import").html(bkg.getLocale("import"));
	$("#importsettings").val(bkg.getLocale("import"));
	$(".i18_export").html(bkg.getLocale("export"));
	$("#settingsall").html(bkg.getLocale("settingsall"));
	$("#settingsimport").attr('placeholder', bkg.getLocale("settingsimport"));
	$("#savetxt").val(bkg.getLocale("savetxt"));
	$(".i18_relaxed").html(bkg.getLocale("relaxed"));
	$(".i18_strict").html(bkg.getLocale("strict"));
	$(".i18_default_public_interface_only").html(bkg.getLocale("default_public_interface_only"));
	$(".i18_disable_non_proxied_udp").html(bkg.getLocale("disable_non_proxied_udp"));
	$(".i18_onlyunwhitelisted").html(bkg.getLocale("onlyunwhitelisted"));
	$(".i18_alldomains").html(bkg.getLocale("alldomains"));
	$(".i18_random").html(bkg.getLocale("random"));
	$(".i18_off").html(bkg.getLocale("off"));
	$(".i18_same").html(bkg.getLocale("same"));
	$(".i18_domain").html(bkg.getLocale("domain"));
	$(".i18_custom").html(bkg.getLocale("custom"));
	$(".i18_sametab").html(bkg.getLocale("sametab"));
	$(".i18_newtab").html(bkg.getLocale("newtab"));
	$(".i18_strictsamedomain").html(bkg.getLocale("strictsamedomain"));
	$(".i18_loosesamedomain").html(bkg.getLocale("loosesamedomain"));
	$(".i18_whitelistmove").attr('title', bkg.getLocale("whitelistmove"));
	$(".i18_blacklistmove").attr('title', bkg.getLocale("blacklistmove"));
	$(".i18_domaintip").html(bkg.getLocale("domaintip"));
	$(".topDomainAdd[data-mode='0']").html(bkg.getLocale("trust"));
	$(".topDomainAdd[data-mode='1']").html(bkg.getLocale("distrust"));
	$("#menu_generalsettings").attr('rel', bkg.getLocale("generalsettings")).html(bkg.getLocale("generalsettings"));
	$("#menu_fingerprint").attr('rel', bkg.getLocale("fingerprintdesc")).html(bkg.getLocale("fingerprint"));
	$("#menu_privacy").attr('rel', bkg.getLocale("privacy")).html(bkg.getLocale("privacy"));
	$("#menu_behavior").attr('rel', bkg.getLocale("behavior")).html(bkg.getLocale("behavior"));
	$("#menu_whitelistblacklist").attr('rel', bkg.getLocale("whitelistblacklist")).html(bkg.getLocale("whitelistblacklist"));
	$("#menu_importexport").attr('rel', bkg.getLocale("importexport")).html(bkg.getLocale("importexport"));
	$("#sectionname").html($('.list-group a.active').attr('rel'));
}
function initTabs() {
	$('.list-group a').on('click', function(e)  {
		var currentAttrValue = $(this).attr('href');
		$("#sectionname").text($(this).attr('rel'));
		$('.tab-content ' + currentAttrValue).show().siblings().hide();
		$(this).addClass('active').siblings().removeClass('active');
		$('.tab-content ' + currentAttrValue).addClass('active').siblings().removeClass('active');
		e.preventDefault();
	});
}
function viewToggle(commit) {
	$("#sidebar, #sectionname").toggle();
	if ($(".tab-content").hasClass('col-sm-9')) {
		$("#viewtoggle").text(bkg.getLocale("groupallsettings")).removeClass('btn-info').addClass('btn-success');
		if (commit) localStorage['optionslist'] = 'true';
		$(".tab-content").removeClass('col-sm-9').addClass('col-sm-12');
		$(".tab").each(function() {
			$(this).prepend('<div class="sectionheading alert alert-success"><h4>'+$("a[href='#"+$(this).attr('id')+"']").attr('rel')+'</h4></div>').show();
		});
		$(".sectionheading:first").css('margin-top', '0px');
		$('#generalsettings .sectionheading').stickyScroll({ topBoundary: $("#generalsettings").offset().top, bottomBoundary: $("#fingerprintprotection").offset().top });
		$('#fingerprintprotection .sectionheading').stickyScroll({ topBoundary: $("#fingerprintprotection").offset().top, bottomBoundary: $("#privacysettings").offset().top });
		$('#privacysettings .sectionheading').stickyScroll({ topBoundary: $("#privacysettings").offset().top, bottomBoundary: $("#behaviorsettings").offset().top });
		$('#behaviorsettings .sectionheading').stickyScroll({ topBoundary: $("#behaviorsettings").offset().top, bottomBoundary: $("#whitelistblacklist").offset().top });
		$('#whitelistblacklist .sectionheading').stickyScroll({ topBoundary: $("#whitelistblacklist").offset().top, bottomBoundary: $("#whitelistblacklist").offset().top });
	} else {
		$("#viewtoggle").text(bkg.getLocale("listallsettings")).removeClass('btn-success').addClass('btn-info');
		if (commit) localStorage['optionslist'] = 'false';
		$(".tab-content").removeClass('col-sm-12').addClass('col-sm-9');
		$(".tab").hide();
		$(".tab.active").show();
		$('.sectionheading').stickyScroll('reset');
		$(".sectionheading").remove();
		$('#sidebar').stickyScroll('reset');
		$('#sidebar').stickyScroll({ container: '#sectionname' });
	}
}
function forceSyncExport() {
	if (confirm(bkg.getLocale("forcesyncexport"))) {
		if (bkg.freshSync(true) == 'true') {
			notification(bkg.getLocale("exportsuccess"));
		}
	}
}
function forceSyncImport() {
	if (confirm(bkg.getLocale("forcesyncimport"))) {
		bkg.importSyncHandle(1);
	}
}
function importbulkwhite() {
	importbulk(0);
}
function importbulkblack() {
	importbulk(1);
}
function settingsall() {
	selectAll('settingsexport');
}
function importwhite() {
	bulk(0);
}
function importblack() {
	bulk(1);
}
function whiteclear() {
	listclear(0);
}
function blackclear() {
	listclear(1);
}
function closeOptions() {
	window.open('', '_self', '');window.close();
}
function whitelistlisten() {
	addList(0);
}
function blacklistlisten() {
	addList(1);
}
function domainsort() {
	saveOptions();listUpdate();fpListUpdate();
}
function loadCheckbox(id) {
	document.getElementById(id).checked = typeof localStorage[id] == "undefined" ? false : localStorage[id] == "true";
}
function loadElement(id) {
	$("#"+id).val(localStorage[id]);
}
function loadList(id) {
	$("#"+id).val(JSON.parse(localStorage[id]).join("\n"));
}
function saveCheckbox(id) {
	localStorage[id] = document.getElementById(id).checked;
}
function saveElement(id) {
	localStorage[id] = $("#"+id).val().replace(/[~|]/g, '');
}
function saveList(id) {
	localStorage[id] = JSON.stringify($("#"+id).val().split("\n"));
}
function loadOptions() {
	$("#title").html("ScriptSafe v"+version);
	loadCheckbox("enable");
	loadCheckbox("syncenable");
	if (!$("#syncenable").prop('checked')) $("#syncbuttons").hide();
	else $("#syncbuttons").show();
	loadCheckbox("syncfromnotify");
	loadCheckbox("updatenotify");
	loadCheckbox("syncnotify");
	loadElement("mode");
	loadCheckbox("refresh");
	loadCheckbox("script");
	loadCheckbox("noscript");
	loadCheckbox("object");
	loadCheckbox("applet");
	loadCheckbox("embed");
	loadCheckbox("iframe");
	loadCheckbox("frame");
	loadCheckbox("audio");
	loadCheckbox("video");
	loadCheckbox("image");
	loadCheckbox("dataurl");
	loadCheckbox("showcontext");
	loadElement("xml");
	loadCheckbox("annoyances");
	loadElement("annoyancesmode");
	loadCheckbox("antisocial");
	loadElement("canvas");
	loadCheckbox("canvasfont");
	loadCheckbox("clientrects");
	loadCheckbox("audioblock");
	loadCheckbox("webgl");
	loadCheckbox("battery");
	loadCheckbox("webrtcdevice");
	loadCheckbox("gamepad");
	loadCheckbox("webvr");
	loadCheckbox("bluetooth");
	loadElement("timezone");
	loadCheckbox("keyboard");
	loadCheckbox("browserplugins");
	if (!$("#keyboard").prop('checked')) $(".keydeltarow").hide();
	else $(".keydeltarow").show();
	loadElement("keydelta");
	if ($("#keydelta").val() < 0 || isNaN(parseInt($("#keydelta").val()))) {
		$("#keydelta").val(40);
		saveElement("keydelta");
	}
	loadCheckbox("webbugs");
	loadCheckbox("utm");
	loadCheckbox("hashchecking");
	loadCheckbox("hashallow");
	loadElement("webrtc");
	if (!bkg.getWebRTC()) $("#webrtccell").html('<strong style="color: red;">'+bkg.getLocale("nowebrtc")+'</strong>');
	loadElement("preservesamedomain");
	loadCheckbox("paranoia");
	loadCheckbox("clipboard");
	loadCheckbox("classicoptions");
	loadElement("referrer");
	loadCheckbox("rating");
	loadCheckbox("domainsort");
	loadElement("linktarget");
	loadCheckbox("cookies");
	loadElement("useragentspoof");
	loadElement("useragentspoof_os");
	loadList("useragent");
	loadElement("useragentinterval");
	loadElement("useragentintervalmins");
	loadCheckbox("uaspoofallow");
	if (localStorage['annoyances'] == 'true' || localStorage['cookies'] == 'true') $("#annoyancesmode").removeAttr('disabled');
	else $("#annoyancesmode").attr('disabled', 'true');
	if ($("#useragentspoof").val() == 'off') $("#useragentspoof_os, #useragentbox, #applytoallow").hide();
	else if ($("#useragentspoof").val() == 'custom') {
		$("#useragentspoof_os").hide();
		$("#useragentbox, #applytoallow").show();
	} else {
		$("#useragentbox").hide();
		$("#useragentspoof_os, #applytoallow").show();
	}
	if ($("#hashchecking").val() == 'off') $("#applytoallowhash").hide();
	else $("#applytoallowhash").show();
	loadCheckbox("referrerspoofdenywhitelisted");
	if (localStorage['referrerspoof'] != 'same' && localStorage['referrerspoof'] != 'domain' && localStorage['referrerspoof'] != 'off') {
		$("#referrerspoof").val('custom');
		$("#customreferrer").show();
		$("#userref").val(localStorage['referrerspoof']);
	} else {
		loadElement("referrerspoof");
		$("#customreferrer").hide();
	}
	if ($("#useragent").val().indexOf("\n") == -1) $(".useragentrandom").hide();
	else $(".useragentrandom").show();
	if (localStorage['useragentinterval'] == 'interval') $("#useragentintervaloption").show();
	else $("#useragentintervaloption").hide();
	if ($("#referrerspoof").val() == 'off') $("#applyreferrerspoofdenywhitelisted").hide();
	else $("#applyreferrerspoofdenywhitelisted").show();
	listUpdate();
	fpListUpdate();
}
function saveOptions() {
	saveCheckbox("enable");
	saveCheckbox("syncenable");
	if (!$("#syncenable").prop('checked')) $("#syncbuttons").hide();
	else $("#syncbuttons").show();
	saveCheckbox("syncnotify");
	saveCheckbox("syncfromnotify");
	saveCheckbox("updatenotify");
	saveElement("mode");
	saveCheckbox("refresh");
	saveCheckbox("script");
	saveCheckbox("noscript");
	saveCheckbox("object");
	saveCheckbox("applet");
	saveCheckbox("embed");
	saveCheckbox("iframe");
	saveCheckbox("frame");
	saveCheckbox("audio");
	saveCheckbox("video");
	saveCheckbox("image");
	saveCheckbox("dataurl");
	saveCheckbox("showcontext");
	saveElement("xml");
	saveCheckbox("annoyances");
	saveElement("annoyancesmode");
	saveCheckbox("antisocial");
	saveElement("canvas");
	saveCheckbox("canvasfont");
	saveCheckbox("clientrects");
	saveCheckbox("audioblock");
	saveCheckbox("webgl");
	saveCheckbox("battery");
	saveCheckbox("webrtcdevice");
	saveCheckbox("gamepad");
	saveCheckbox("webvr");
	saveCheckbox("bluetooth");
	saveElement("timezone");
	saveCheckbox("keyboard");
	saveCheckbox("browserplugins");
	if (!$("#keyboard").prop('checked')) $(".keydeltarow").hide();
	else $(".keydeltarow").show();
	saveElement("keydelta");
	saveCheckbox("webbugs");
	saveCheckbox("utm");
	saveCheckbox("hashchecking");
	saveCheckbox("hashallow");
	saveElement("webrtc");
	saveElement("preservesamedomain");
	saveCheckbox("paranoia");
	saveCheckbox("clipboard");
	saveCheckbox("classicoptions");
	saveElement("referrer");
	saveCheckbox("rating");
	saveCheckbox("cookies");
	saveElement("useragentspoof");
	saveElement("useragentspoof_os");
	var userAgents = $("#useragent").val();
	if (userAgents) {
		var validUserAgents = [];
		userAgents = userAgents.split("\n");
		var sanitizedAgent;
		for (var i=0, userAgentNum=userAgents.length; i<userAgentNum; i++) {
			sanitizedAgent = $.trim(userAgents[i].replace(/[~|]/g, ''));
			if (sanitizedAgent) validUserAgents.push(sanitizedAgent);
		}
		$("#useragent").val(validUserAgents.join("\n"));
	}
	saveList("useragent");
	saveElement("useragentinterval");
	saveElement("useragentintervalmins");
	saveCheckbox("uaspoofallow");
	saveCheckbox("referrerspoofdenywhitelisted");
	if ($("#referrerspoof").val() != 'custom') {
		saveElement("referrerspoof");
		$("#customreferrer").hide();
	} else {
		if ($("#userref").val() != '') localStorage['referrerspoof'] = $("#userref").val();
		else {
			$("#customreferrer").show();
			$("#userref").focus;
		}
	}
	saveElement("linktarget");
	saveCheckbox("domainsort");
	if (localStorage['annoyances'] == 'true' || localStorage['cookies'] == 'true') $("#annoyancesmode").removeAttr('disabled');
	else $("#annoyancesmode").attr('disabled', 'true');
	if (localStorage['useragentspoof'] == 'off') $("#useragentspoof_os, #useragentbox, #applytoallow").hide();
	else if (localStorage['useragentspoof'] == 'custom') {
		$("#useragentspoof_os").hide();
		$("#useragentbox, #applytoallow").show();
	} else {
		$("#useragentbox").hide();
		$("#useragentspoof_os, #applytoallow").show();
	}
	if (localStorage['hashchecking'] != 'off') $("#applytoallowhash").show();
	else $("#applytoallowhash").hide();
	if ($("#useragent").val().indexOf("\n") == -1) $(".useragentrandom").hide();
	else $(".useragentrandom").show();
	if (localStorage['useragentinterval'] == 'interval') $("#useragentintervaloption").show();
	else $("#useragentintervaloption").hide();
	if (localStorage['referrerspoof'] != 'off') $("#applyreferrerspoofdenywhitelisted").show();
	else $("#applyreferrerspoofdenywhitelisted").hide();
	updateExport();
	bkg.refreshRequestTypes();
	bkg.initWebRTC();
	bkg.reinitContext();
	syncstatus = bkg.freshSync();
	if (syncstatus) {
		notification(bkg.getLocale("settingssavesync"));
	} else {
		notification(bkg.getLocale("settingssave"));
	}
}
function saveLang() {
	saveElement("locale");
	updateExport();
	bkg.initLang(localStorage['locale'], 0);
	setTimeout(function() {
		i18load();
		syncstatus = bkg.freshSync();
		if (syncstatus) {
			notification(bkg.getLocale("settingssavesync"));
		} else {
			notification(bkg.getLocale("settingssave"));
		}
	}, 1000);
}
function selectAll(id) {
	$("#"+id).select();
}
function settingsImport() {
	var error = "";
	var settings = $("#settingsimport").val().split("\n");
	if ($.trim($("#settingsimport").val()) == "") {
		notification(bkg.getLocale("pastesettings"));
		return false;
	}
	if (settings.length > 0) {
		$.each(settings, function(i, v) {
			if ($.trim(v) != "") {
				var settingentry = $.trim(v).split("|");
				if (settingnames.indexOf($.trim(settingentry[0])) != -1 && ($.trim(settingentry[1]) != '' || $.trim(settingentry[0]) == 'useragent')) {
					if ($.trim(settingentry[0]) == 'whiteList' || $.trim(settingentry[0]) == 'blackList' || $.trim(settingentry[0]) == 'useragent') {
						var listarray = $.trim(settingentry[1]).replace(/(\[|\]|")/g,"").split(",");
						if ($.trim(settingentry[0]) == 'whiteList' && listarray.toString() != '') localStorage['whiteList'] = JSON.stringify(listarray);
						else if ($.trim(settingentry[0]) == 'blackList' && listarray.toString() != '') localStorage['blackList'] = JSON.stringify(listarray);
						else if ($.trim(settingentry[0]) == 'useragent' && listarray.toString() != '') localStorage['useragent'] = JSON.stringify(listarray);
					} else 
						localStorage[$.trim(settingentry[0])] = $.trim(settingentry[1]);
				} else {
					error += $.trim(settingentry[0])+", ";
				}
			}
		});
	}
	loadOptions();
	listUpdate();
	fpListUpdate();
	bkg.refreshRequestTypes();
	bkg.initWebRTC();
	bkg.cacheLists();
	bkg.cacheFpLists();
	bkg.initLang(localStorage['locale'], 0);
	setTimeout(function() {
		i18load();
		$("#locale").val(localStorage['locale'])
		syncstatus = bkg.freshSync();
		if (!error) {
			if (syncstatus) notification(bkg.getLocale("importsuccesssync"));
			else notification(bkg.getLocale("importsuccessoptions"));
		} else {
			if (syncstatus) notification(bkg.getLocale("importsuccesscond")+' '+error.slice(0, -2)+'<br /><br />'+bkg.getLocale("settingssavesync"));
			else notification(bkg.getLocale("importsuccesscond")+' '+error.slice(0, -2));
		}
		$("#settingsimport").val("");
	}, 1000);
}
function downloadtxt() {
	var textToWrite = $("#settingsexport").val();
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var fileNameToSaveAs = "scriptsafe-settings-"+new Date().toJSON()+".txt";
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = function(e) { document.body.removeChild(e.target); };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
function updateExport() {
	settingnames = [];
	$("#settingsexport").val("");
	for (var i in localStorage) {
		if (localStorage.hasOwnProperty(i)) {
			if (i != "version" && i != "tempregexflag" && i != "whiteListCount" && i != "blackListCount" && i != "whiteListCount2" && i != "blackListCount2" && i.substr(0, 2) != "zb" && i.substr(0, 2) != "zw" && i.substr(0, 2) != "sb" && i.substr(0, 2) != "sw" && i.substr(0, 2) != "sf") {
				settingnames.push(i);
				$("#settingsexport").val($("#settingsexport").val()+i+"|"+localStorage[i]+"\n");
			}
		}
	}
	$("#settingsexport").val($("#settingsexport").val().slice(0,-1));
}
function is_int(value){ 
	if ((parseFloat(value) == parseInt(value)) && !isNaN(value)) return true;
	return false;
}
function notification(msg) {
	$('#message').html(msg).stop().fadeIn("slow").delay(2000).fadeOut("slow")
}
function addList(type) {
	var domain = $('#url').val().toLowerCase().replace("http://", "").replace("https://", "");
	if (!domain.match(/^(?:[\-\w\*\?]+(\.[\-\w\*\?]+)*|((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})|\[[A-Fa-f0-9:.]+\])?$/g)) {
		notification(bkg.getLocale("domaininvalid"));
	} else if (!domain.match(/[a-z0-9]/g)) {
		notification(bkg.getLocale("domaininvalid2"));
	} else {
		if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && bkg.domainCheck(domain, 1) != '0')) && bkg.baddies(bkg.getDomain(domain), localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && bkg.baddies(bkg.getDomain(domain), localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
			notification(bkg.getLocale("domaininvalid3"));
		} else {
			var responseflag = bkg.domainHandler(domain, type);
			if (responseflag) {
				$('#url').val('');
				syncstatus = bkg.freshSync();
				if (syncstatus) {
					notification([bkg.getLocale("whitelisted"),bkg.getLocale("blacklisted")][type]+' '+domain+' and syncing in 10 seconds.');
				} else {
					notification([bkg.getLocale("whitelisted"),bkg.getLocale("blacklisted")][type]+' '+domain+'.');
				}
				listUpdate();
			} else {
				notification(domain+' not added as it already exists in the list or the entire domain has been '+[bkg.getLocale("whitelisted"),bkg.getLocale("blacklisted")][type]);
			}
			$('#url').focus();
		}
	}
	return false;
}
function addFPList() {
	var elid = $(this).attr('id').substr(0, $(this).attr('id').indexOf('whitebind'));
	var domain = $('#'+elid+'url').val().toLowerCase().replace("http://", "").replace("https://", "");
	if (!domain.match(/^(?:[\-\w\*\?]+(\.[\-\w\*\?]+)*|((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})|\[[A-Fa-f0-9:.]+\])?$/g)) {
		notification(bkg.getLocale("domaininvalid"));
	} else if (!domain.match(/[a-z0-9]/g)) {
		notification(bkg.getLocale("domaininvalid2"));
	} else {
		var responseflag = bkg.fpDomainHandler(domain, elid, 1);
		if (responseflag) {
			$('#'+elid+'url').val('');
			syncstatus = bkg.freshSync();
			if (syncstatus) {
				notification(bkg.getLocale("whitelisted")+' '+domain+' and syncing in 10 seconds.');
			} else {
				notification(bkg.getLocale("whitelisted")+' '+domain+'.');
			}
			fpListUpdate();
		} else {
			notification(domain+' not added as it already exists in the list or the entire domain has been '+bkg.getLocale("whitelisted"));
		}
		$('#'+elid+'url').focus();
	}
	return false;
}
function domainRemover(domain, type) {
	if (confirm("Are you sure you want to remove "+domain+" from this list?")) {
		if (type === undefined) type = false;
		if (!type) {
			bkg.domainHandler(domain,2);
			listUpdate();
		} else {
			bkg.fpDomainHandler(domain,type,-1);
			fpListUpdate();
		}
		syncstatus = bkg.freshSync();
		if (syncstatus) {
			notification('Successfully removed: '+domain+' and syncing in 10 seconds.');
		} else {
			notification('Successfully removed: '+domain);
		}
	}
	return false;
}
function domainMove(domain, mode) {
	var lingo;
	if (mode == '0') lingo = bkg.getLocale("whitelistlow");
	else if (mode == '1') lingo = bkg.getLocale("blacklistlow");
	if (confirm("Are you sure you want to move "+domain+" to the "+lingo+"?")) {
		bkg.domainHandler(domain, mode);
		listUpdate();
		syncstatus = bkg.freshSync();
		if (syncstatus) {
			notification([bkg.getLocale("whitelisted"),bkg.getLocale("blacklisted")][mode]+' '+domain+' and syncing in 10 seconds.');
		} else {
			notification([bkg.getLocale("whitelisted"),bkg.getLocale("blacklisted")][mode]+' '+domain);
		}
	}
	return false;
}
function topDomainAdd(domain, mode) {
	var lingo;
	var fpmode = false;
	if (mode == '0') lingo = bkg.getLocale("trustlow");
	else if (mode == '1') lingo = bkg.getLocale("distrustlow");
	else {
		lingo = bkg.getLocale("trustlow");
		fpmode = true;
	}
	if (domain && !domain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && !domain.match(/^(?:\[[A-Fa-f0-9:.]+\])$/g) && domain.indexOf('**.') != 0 && confirm("Are you sure you want to "+lingo+" "+bkg.getDomain(domain)+"?\r\n\r\Click OK will mean all subdomains on "+bkg.getDomain(domain)+" will be "+lingo+"ed, such as _."+bkg.getDomain(domain)+" and even _._._."+bkg.getDomain(domain)+".")) {
		bkg.topHandler(domain, mode);
		if (!fpmode) listUpdate();
		else fpListUpdate();
		bkg.freshSync();
		notification('Successfully '+lingo+'ed: '+domain);
	}
}
function hidebulk() {
	$("#bulk").slideUp("fast");
}
function bulk(type) {
	var error = false;
	if (!$("#bulk").is(":visible")) {
		$("#bulk").slideDown("fast");
		$('html, body').animate({
			scrollTop: ($("#bulk").offset().top-55)
		}, 'slow');
	} else {
		if ((type == '0' && $("#bulk strong").html() == bkg.getLocale("whitelist")+" "+bkg.getLocale("bulkimportcap")) || (type == '1' && $("#bulk strong").html() == bkg.getLocale("blacklist")+" "+bkg.getLocale("bulkimportcap"))) hidebulk();
	}
	$("#bulk textarea").focus();
	if (type == '0') {
		$("#bulk strong").html(bkg.getLocale("whitelist")+" "+bkg.getLocale("bulkimportcap"));
		$("#bulkbtn").val(bkg.getLocale("whitebind")).click(importbulkwhite);
	} else if (type == '1') {
		$("#bulk strong").html(bkg.getLocale("blacklist")+" "+bkg.getLocale("bulkimportcap"));
		$("#bulkbtn").val(bkg.getLocale("blackbind")).click(importbulkblack);
	}
}
function importbulk(type) {
	var error = '';
	var domains = $("#bulk textarea").val().split("\n");
	if ($.trim($("#bulk textarea").val()) == "") {
		hidebulk();
		return false;
	}
	if (domains.length > 0) {
		$.each(domains, function(i, v) {
			if ($.trim(v) != "") {
				var domain = $.trim(v).toLowerCase().replace("http://", "").replace("https://", "");
				if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && bkg.domainCheck(domain.replace("http://", "").replace("https://", ""), 1) != '0')) && bkg.baddies(bkg.getDomain(domain.replace("http://", "").replace("https://", "")), localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && bkg.baddies(bkg.getDomain(domain.replace("http://", "").replace("https://", "")), localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
					error += '<li>'+domain.replace("http://", "").replace("https://", "")+' <b>(provider of unwanted content (see "Block Unwanted Content" and/or "Antisocial Mode")</b></li>';
				} else {
					if (domain.match(/^(?:[\-\w\*\?]+(\.[\-\w\*\?]+)*|((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})|\[[A-Fa-f0-9:.]+\])?$/g)) {
						bkg.domainHandler(domain, type);
					} else {
						error += '<li>'+domain+'</li>';
					}
				}
			}
		});
	}
	listUpdate();
	if (!error) {
		syncstatus = bkg.freshSync();
		if (syncstatus) {
			notification('Domains imported successfully and syncing in 10 seconds');
		} else {
			notification('Domains imported successfully');
		}
		if ($("#bulk").is(":visible")) hidebulk();
		$("#bulk textarea").val("");
		$('#importerror').hide();
	} else {
		bkg.freshSync();
		notification('Error importing some domains');
		$('#importerror').html('<strong>Some Domains Not Imported</strong><br />The following domains were not imported as they are invalid (the others were successfully imported): <ul>'+error+'</ul>').stop().fadeIn("slow");
	}
}
function listUpdate() {
	var whiteList = JSON.parse(localStorage['whiteList']);
	var blackList = JSON.parse(localStorage['blackList']);
	var whitelistCompiled = '';
	var whitelistLength = whiteList.length;
	if (whitelistLength==0) whitelistCompiled = '[currently empty]';
	else {
		if (localStorage['domainsort'] == 'true') whiteList = bkg.domainSort(whiteList);
		else whiteList.sort();
		for (var i in whiteList) {
			if ((whiteList[i][0] == '*' && whiteList[i][1] == '*') || whiteList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || whiteList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" class="domainMove i18_blacklistmove" title=\''+bkg.getLocale("blacklistmove")+'\' data-domain=\''+whiteList[i]+'\' data-mode="1"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span></a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+whiteList[i]+'</div>';
			else whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+bkg.getLocale("trust")+' '+whiteList[i]+'\' data-domain=\''+whiteList[i]+'\' data-mode="0">'+bkg.getLocale("trust")+'</a> | <a href="javascript:;" class="domainMove i18_blacklistmove" title=\''+bkg.getLocale("blacklistmove")+'\' data-domain=\''+whiteList[i]+'\' data-mode="1"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span></a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+whiteList[i]+'</div>';
		}
	}
	var blacklistCompiled = '';
	var blacklistLength = blackList.length;
	if (blacklistLength==0) blacklistCompiled = '[currently empty]';
	else {
		if (localStorage['domainsort'] == 'true') blackList = bkg.domainSort(blackList);
		else blackList.sort();
		for (var i in blackList) {
			if ((blackList[i][0] == '*' &&  blackList[i][1] == '*') || blackList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || blackList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" class="domainMove i18_whitelistmove" title=\''+bkg.getLocale("whitelistmove")+'\' data-domain=\''+blackList[i]+'\' data-mode="0"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span></a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+blackList[i]+'</div>';
			else blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+bkg.getLocale("distrust")+' '+blackList[i]+'\' data-domain=\''+blackList[i]+'\' data-mode="1">'+bkg.getLocale("distrust")+'</a> | <a href="javascript:;" class="domainMove i18_whitelistmove" title=\''+bkg.getLocale("whitelistmove")+'\' data-domain=\''+blackList[i]+'\' data-mode="0"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span></a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+blackList[i]+'</div>';
		}
	}
	$('#whitelist').html(whitelistCompiled);
	$('#blacklist').html(blacklistCompiled);
	$('#whitelistcount').html(whitelistLength);
	$('#blacklistcount').html(blacklistLength);
	$(".domainRemover, .topDomainAdd, .domainMove").unbind('click');
	$(".domainRemover").click(function() { domainRemover($(this).attr('rel'));});
	$(".topDomainAdd").click(function() { topDomainAdd($(this).attr('data-domain'), $(this).attr('data-mode'));});
	$(".domainMove").click(function() { domainMove($(this).attr('data-domain'), $(this).attr('data-mode'));});
	updateExport();
}
function fpListUpdate() {
	var fpTypes = ['fpCanvas', 'fpCanvasFont', 'fpAudio', 'fpWebGL', 'fpBattery', 'fpDevice', 'fpGamepad', 'fpWebVR', 'fpBluetooth', 'fpClientRectangles', 'fpClipboard', 'fpBrowserPlugins'];
	for (var i in fpTypes) {
		fpListProcess(fpTypes[i]);
	}
	$(".fpDomainRemover, .fpTopDomainAdd").unbind('click');
	$(".fpDomainRemover").click(function() { domainRemover($(this).attr('rel'), $(this).parent().parent().parent().attr('id')); });
	$(".fpTopDomainAdd").click(function() { topDomainAdd($(this).attr('data-domain'), $(this).parent().parent().parent().attr('id'));});
	updateExport();
}
function fpListProcess(fpType) {
	var fpList = JSON.parse(localStorage[fpType]);
	var fpListCompiled = '';
	var fpListLength = fpList.length;
	if (fpListLength==0) fpListCompiled = '[currently empty]';
	else {
		if (localStorage['domainsort'] == 'true') fpList = bkg.domainSort(fpList);
		else fpList.sort();
		for (var i in fpList) {
			if (fpList[i][0] == '*' || fpList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || fpList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) fpListCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="fpDomainRemover" rel=\''+fpList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+fpList[i]+'</div>';
			else fpListCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="fpDomainRemover" rel=\''+fpList[i]+'\'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>'+fpList[i]+'</div>';
		}
	}
	$('#'+fpType).html(fpListCompiled);
	$('#'+fpType+'count').html(fpListLength);
}
function listclear(type) {
	if (confirm(['Clear whitelist?','Clear blacklist?'][type])) {
		localStorage[['whiteList','blackList'][type]] = JSON.stringify([]);
		listUpdate();
		bkg.cacheLists();
		if (bkg.freshSync(2)) {
			notification(bkg.getLocale("settingssavesync"));
		} else {
			notification(bkg.getLocale("settingssave"));
		}
	}
	return false;
}

!function(t){t.fn.stickyScroll=function(o){var e={init:function(o){function e(){return t(document).height()-i.container.offset().top-i.container.attr("offsetHeight")}function s(){return i.container.offset().top}function n(o){return t(o).attr("offsetHeight")}var i;return"auto"!==o.mode&&"manual"!==o.mode&&(o.container&&(o.mode="auto"),o.bottomBoundary&&(o.mode="manual")),i=t.extend({mode:"auto",container:t("body"),topBoundary:null,bottomBoundary:null},o),i.container=t(i.container),i.container.length?("auto"===i.mode&&(i.topBoundary=s(),i.bottomBoundary=e()),this.each(function(o){var c=t(this),a=t(window),r=Date.now()+o,l=n(c);c.data("sticky-id",r),a.bind("scroll.stickyscroll-"+r,function(){var o=t(document).scrollTop(),e=t(document).height()-o-l;e<=i.bottomBoundary?c.offset({top:t(document).height()-i.bottomBoundary-l}).removeClass("sticky-active").removeClass("sticky-inactive").addClass("sticky-stopped"):o>i.topBoundary?c.offset({top:t(window).scrollTop()}).removeClass("sticky-stopped").removeClass("sticky-inactive").addClass("sticky-active"):o<i.topBoundary&&c.css({position:"",top:"",bottom:""}).removeClass("sticky-stopped").removeClass("sticky-active").addClass("sticky-inactive")}),a.bind("resize.stickyscroll-"+r,function(){"auto"===i.mode&&(i.topBoundary=s(),i.bottomBoundary=e()),l=n(c),t(this).scroll()}),c.addClass("sticky-processed"),a.scroll()})):void(console&&console.log("StickyScroll: the element "+o.container+" does not exist, we're throwing in the towel"))},reset:function(){return this.each(function(){var o=t(this),e=o.data("sticky-id");o.css({position:"",top:"",bottom:""}).removeClass("sticky-stopped").removeClass("sticky-active").removeClass("sticky-inactive").removeClass("sticky-processed"),t(window).unbind(".stickyscroll-"+e)})}};return e[o]?e[o].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof o&&o?void(console&&console.log("Method"+o+" does not exist on jQuery.stickyScroll")):e.init.apply(this,arguments)}}(jQuery);