// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
'use strict';
var version = '1.0.8.5';
var bkg = chrome.extension.getBackgroundPage();
var settingnames = [];
var syncstatus;
document.addEventListener('DOMContentLoaded', function () {
	initTabs();
	i18load();
	loadOptions();
	$(".save").click(saveOptions);
	$("#domainsort").click(domainsort);
	$("#whitebind").click(whitelistlisten);
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
	syncstatus = localStorage['syncenable'];
	$(".row-offcanvas").show();
	if (localStorage['optionslist'] == 'true') viewToggle(0);
	$('#sidebar').stickyScroll({ container: '#sectionname' });
});
function i18load() {
	$(".i18_support").html(chrome.i18n.getMessage("support"));
	$(".i18_listallsettings").html(chrome.i18n.getMessage("listallsettings"));
	$(".i18_groupallsettings").html(chrome.i18n.getMessage("groupallsettings"));
	$(".i18_sections").html(chrome.i18n.getMessage("sections"));
	$(".i18_save").val(chrome.i18n.getMessage("save"));
	$(".i18_close").val(chrome.i18n.getMessage("close"));
	$(".i18_enable").html(chrome.i18n.getMessage("enable"));
	$(".i18_mode").html(chrome.i18n.getMessage("mode"));
	$(".i18_default").html(chrome.i18n.getMessage("default"));
	$(".i18_enabled").html(chrome.i18n.getMessage("enabled"));
	$(".i18_disabled").html(chrome.i18n.getMessage("disabled"));
	$(".i18_enablesyncing").html(chrome.i18n.getMessage("enablesyncing"));
	$("#syncimport").val(chrome.i18n.getMessage("syncimport"));
	$("#syncexport").val(chrome.i18n.getMessage("syncexport"));
	$(".i18_blockrec").html(chrome.i18n.getMessage("blockrec"));
	$(".i18_block").html(chrome.i18n.getMessage("block"));
	$(".i18_allow").html(chrome.i18n.getMessage("allow"));
	$(".i18_disableremove").html(chrome.i18n.getMessage("disableremove"));
	$(".i18_xml").html(chrome.i18n.getMessage("xml"));
	$(".i18_disabledcap").html(chrome.i18n.getMessage("disabledcap"));
	$(".i18_xmlcross").html(chrome.i18n.getMessage("xmlcross"));
	$(".i18_xmlall").html(chrome.i18n.getMessage("xmlall"));
	$(".i18_xmldesc").html(chrome.i18n.getMessage("xmldesc"));
	$(".i18_syncnotify").html(chrome.i18n.getMessage("syncnotify"));
	$(".i18_syncnotifydesc").html(chrome.i18n.getMessage("syncnotifydesc"));
	$(".i18_syncfromnotify").html(chrome.i18n.getMessage("syncfromnotify"));
	$(".i18_syncfromnotifydesc").html(chrome.i18n.getMessage("syncfromnotifydesc"));
	$(".i18_updatenotify").html(chrome.i18n.getMessage("updatenotify"));
	$(".i18_updatenotifydesc").html(chrome.i18n.getMessage("updatenotifydesc"));
	$(".i18_hotkeys").html(chrome.i18n.getMessage("hotkeys"));
	$(".i18_availablehotkeys").html(chrome.i18n.getMessage("availablehotkeys"));
	$(".i18_hotkeystoggle").html(chrome.i18n.getMessage("hotkeystoggle"));
	$(".i18_hotkeysremove").html(chrome.i18n.getMessage("hotkeysremove"));
	$(".i18_hotkeysremoveall").html(chrome.i18n.getMessage("hotkeysremoveall"));
	$("#hotkeyspage").html(chrome.i18n.getMessage("hotkeyspage"));
	$(".i18_hotkeysinst").html(chrome.i18n.getMessage("hotkeysinst"));
	$(".i18_canvas").html(chrome.i18n.getMessage("canvas"));
	$(".i18_canvasblank").html(chrome.i18n.getMessage("canvasblank"));
	$(".i18_canvasrandom").html(chrome.i18n.getMessage("canvasrandom"));
	$(".i18_canvasblock").html(chrome.i18n.getMessage("canvasblock"));
	$(".i18_canvasdesc").html(chrome.i18n.getMessage("canvasdesc"));
	$(".i18_audioblock").html(chrome.i18n.getMessage("audioblock"));
	$(".i18_audioblockdesc").html(chrome.i18n.getMessage("audioblockdesc"));
	$(".i18_webgl").html(chrome.i18n.getMessage("webgl"));
	$(".i18_webgldesc").html(chrome.i18n.getMessage("webgldesc"));
	$(".i18_battery").html(chrome.i18n.getMessage("battery"));
	$(".i18_batterydesc").html(chrome.i18n.getMessage("batterydesc"));
	$(".i18_webrtcdevice").html(chrome.i18n.getMessage("webrtcdevice"));
	$(".i18_webrtcdevicedesc").html(chrome.i18n.getMessage("webrtcdevicedesc"));
	$(".i18_gamepad").html(chrome.i18n.getMessage("gamepad"));
	$(".i18_gamepaddesc").html(chrome.i18n.getMessage("gamepaddesc"));
	$(".i18_canvasfont").html(chrome.i18n.getMessage("canvasfont"));
	$(".i18_canvasfontdesc").html(chrome.i18n.getMessage("canvasfontdesc"));
	$(".i18_clientrects").html(chrome.i18n.getMessage("clientrects"));
	$(".i18_clientrectsdesc").html(chrome.i18n.getMessage("clientrectsdesc"));
	$(".i18_keyboard").html(chrome.i18n.getMessage("keyboard"));
	$(".i18_keyboarddesc").html(chrome.i18n.getMessage("keyboarddesc"));
	$(".i18_paranoia").html(chrome.i18n.getMessage("paranoia"));
	$(".i18_paranoiadesc").html(chrome.i18n.getMessage("paranoiadesc"));
	$(".i18_annoyances").html(chrome.i18n.getMessage("annoyances"));
	$(".i18_annoyancesdesc").html(chrome.i18n.getMessage("annoyancesdesc"));
	$(".i18_cookies").html(chrome.i18n.getMessage("cookies"));
	$(".i18_cookiesdesc").html(chrome.i18n.getMessage("cookiesdesc"));
	$(".i18_annoyancesmode").html(chrome.i18n.getMessage("annoyancesmode"));
	$(".i18_annoyancesmodedesc").html(chrome.i18n.getMessage("annoyancesmodedesc"));
	$(".i18_antisocial").html(chrome.i18n.getMessage("antisocial"));
	$(".i18_antisocialdesc").html(chrome.i18n.getMessage("antisocialdesc"));
	$(".i18_antisocialdesc2").html(chrome.i18n.getMessage("antisocialdesc2"));
	$(".i18_webbugs").html(chrome.i18n.getMessage("webbugs"));
	$(".i18_webbugsdesc").html(chrome.i18n.getMessage("webbugsdesc"));
	$(".i18_utm").html(chrome.i18n.getMessage("utm"));
	$(".i18_utmdesc").html(chrome.i18n.getMessage("utmdesc"));
	$(".i18_hashchecking").html(chrome.i18n.getMessage("hashchecking"));
	$(".i18_hashcheckingdesc").html(chrome.i18n.getMessage("hashcheckingdesc"));
	$(".i18_webrtc").html(chrome.i18n.getMessage("webrtc"));
	$(".i18_webrtcdesc").html(chrome.i18n.getMessage("webrtcdesc"));
	$(".i18_referrer").html(chrome.i18n.getMessage("referrer"));
	$(".i18_referrerdesc").html(chrome.i18n.getMessage("referrerdesc"));
	$(".i18_timezone").html(chrome.i18n.getMessage("timezone"));
	$(".i18_timezonedesc").html(chrome.i18n.getMessage("timezonedesc"));
	$(".i18_useragentspoof").html(chrome.i18n.getMessage("useragentspoof"));
	$(".i18_useragentspoofdesc").html(chrome.i18n.getMessage("useragentspoofdesc"));
	$(".i18_uaspoofallow").html(chrome.i18n.getMessage("uaspoofallow"));
	$(".i18_referrerspoof").html(chrome.i18n.getMessage("referrerspoof"));
	$(".i18_referrerspoofdesc").html(chrome.i18n.getMessage("referrerspoofdesc"));
	$("#userref").attr('placeholder', chrome.i18n.getMessage("userref"));
	$(".i18_linktarget").html(chrome.i18n.getMessage("linktarget"));
	$(".i18_linktargetdesc").html(chrome.i18n.getMessage("linktargetdesc"));
	$(".i18_preservesamedomain").html(chrome.i18n.getMessage("preservesamedomain"));
	$(".i18_preservesamedomaindesc").html(chrome.i18n.getMessage("preservesamedomaindesc"));
	$(".i18_refresh").html(chrome.i18n.getMessage("refresh"));
	$(".i18_refreshdesc").html(chrome.i18n.getMessage("refreshdesc"));
	$(".i18_rating").html(chrome.i18n.getMessage("rating"));
	$(".i18_ratingdesc").html(chrome.i18n.getMessage("ratingdesc"));
	$(".i18_classicoptions").html(chrome.i18n.getMessage("classicoptions"));
	$(".i18_classicoptionsdesc").html(chrome.i18n.getMessage("classicoptionsdesc"));
	$(".i18_clipboard").html(chrome.i18n.getMessage("clipboard"));
	$(".i18_clipboarddesc").html(chrome.i18n.getMessage("clipboarddesc"));
	$(".i18_domainsort").html(chrome.i18n.getMessage("domainsort"));
	$(".i18_domainsortdesc").html(chrome.i18n.getMessage("domainsortdesc"));
	$(".i18_url").html(chrome.i18n.getMessage("url"));
	$("#url").attr('placeholder', chrome.i18n.getMessage("urldesc"));
	$("#whitebind").val(chrome.i18n.getMessage("whitebind"));
	$("#blackbind").val(chrome.i18n.getMessage("blackbind"));
	$("#domaininfo").val(chrome.i18n.getMessage("domaininfo"));
	$(".i18_whitelist").html(chrome.i18n.getMessage("whitelist"));
	$(".i18_blacklist").html(chrome.i18n.getMessage("blacklist"));
	$("#blackclear, #whiteclear").html(chrome.i18n.getMessage("clearlow"));
	$("#importwhite, #importblack").html(chrome.i18n.getMessage("bulkimport"));
	$(".i18_bulkimportcap").html(chrome.i18n.getMessage("bulkimportcap"));
	$(".i18_bulkimportcapdesc").html(chrome.i18n.getMessage("bulkimportcapdesc"));
	$("#bulkbtn").html(chrome.i18n.getMessage("bulkbtn"));
	$("#hideimport").val(chrome.i18n.getMessage("hide"));
	$(".i18_import").html(chrome.i18n.getMessage("import"));
	$("#importsettings").val(chrome.i18n.getMessage("import"));
	$(".i18_export").html(chrome.i18n.getMessage("export"));
	$("#settingsall").html(chrome.i18n.getMessage("settingsall"));
	$("#settingsimport").attr('placeholder', chrome.i18n.getMessage("settingsimport"));
	$("#savetxt").val(chrome.i18n.getMessage("savetxt"));
	$(".i18_relaxed").html(chrome.i18n.getMessage("relaxed"));
	$(".i18_strict").html(chrome.i18n.getMessage("strict"));
	$(".i18_default_public_interface_only").html(chrome.i18n.getMessage("default_public_interface_only"));
	$(".i18_disable_non_proxied_udp").html(chrome.i18n.getMessage("disable_non_proxied_udp"));
	$(".i18_onlyunwhitelisted").html(chrome.i18n.getMessage("onlyunwhitelisted"));
	$(".i18_alldomains").html(chrome.i18n.getMessage("alldomains"));
	$(".i18_random").html(chrome.i18n.getMessage("random"));
	$(".i18_off").html(chrome.i18n.getMessage("off"));
	$(".i18_same").html(chrome.i18n.getMessage("same"));
	$(".i18_domain").html(chrome.i18n.getMessage("domain"));
	$(".i18_custom").html(chrome.i18n.getMessage("custom"));
	$(".i18_sametab").html(chrome.i18n.getMessage("sametab"));
	$(".i18_newtab").html(chrome.i18n.getMessage("newtab"));
	$(".i18_strictsamedomain").html(chrome.i18n.getMessage("strictsamedomain"));
	$(".i18_loosesamedomain").html(chrome.i18n.getMessage("loosesamedomain"));
	$(".i18_whitelistmove").html(chrome.i18n.getMessage("whitelistmove"));
	$(".i18_blacklistmove").html(chrome.i18n.getMessage("blacklistmove"));
	$(".i18_domaintip").html(chrome.i18n.getMessage("domaintip"));
	$("#sectionname").html(chrome.i18n.getMessage("generalsettings"));
	$("#menu_generalsettings").attr('rel', chrome.i18n.getMessage("generalsettings")).html(chrome.i18n.getMessage("generalsettings"));
	$("#menu_fingerprint").attr('rel', chrome.i18n.getMessage("fingerprintdesc")).html(chrome.i18n.getMessage("fingerprint"));
	$("#menu_privacy").attr('rel', chrome.i18n.getMessage("privacy")).html(chrome.i18n.getMessage("privacy"));
	$("#menu_behavior").attr('rel', chrome.i18n.getMessage("behavior")).html(chrome.i18n.getMessage("behavior"));
	$("#menu_whitelistblacklist").attr('rel', chrome.i18n.getMessage("whitelistblacklist")).html(chrome.i18n.getMessage("whitelistblacklist"));
	$("#menu_importexport").attr('rel', chrome.i18n.getMessage("importexport")).html(chrome.i18n.getMessage("importexport"));
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
		$("#viewtoggle").text(chrome.i18n.getMessage("groupallsettings")).removeClass('btn-info').addClass('btn-success');
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
		$("#viewtoggle").text(chrome.i18n.getMessage("listallsettings")).removeClass('btn-success').addClass('btn-info');
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
	if (confirm(chrome.i18n.getMessage("forcesyncexport"))) {
		if (bkg.freshSync(0, true) == 'true') {
			notification(chrome.i18n.getMessage("exportsuccess"));
		}
	}
}
function forceSyncImport() {
	if (confirm(chrome.i18n.getMessage("forcesyncimport"))) {
		bkg.importSyncHandle(1);
		setTimeout(function(){ window.location.reload(1); }, 10000);
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
function saveCheckbox(id) {
	localStorage[id] = document.getElementById(id).checked;
	if (id == 'syncenable') {
		if (!document.getElementById(id).checked) {
			syncstatus = 'false';
			return;
		}
		if (syncstatus == 'false') {
			alert(chrome.i18n.getMessage("forcesyncimport"));
			syncstatus = 'true';
		} else {
			syncstatus = 'true';
		}
	}
}
function saveElement(id) {
	localStorage[id] = $("#"+id).val();
}
function loadOptions() {
	$("#title").html("ScriptSafe v"+version);
	loadCheckbox("enable");
	loadCheckbox("syncenable");
	if (!$("#syncenable").prop('checked')) $("#syncbuttons").hide();
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
	loadElement("xml");
	loadCheckbox("annoyances");
	if (!$("#annoyances").prop('checked')) $("#annoyancesmode").attr('disabled', 'true');
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
	loadElement("timezone");
	loadCheckbox("keyboard");
	loadCheckbox("webbugs");
	loadCheckbox("utm");
	loadCheckbox("hashchecking");
	loadElement("webrtc");
	if (!bkg.getWebRTC()) $("#webrtccell").html('<strong style="color: red;">'+chrome.i18n.getMessage("nowebrtc")+'</strong>');
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
	loadCheckbox("uaspoofallow");
	if ($("#useragentspoof").val() == 'off') $("#useragentspoof_os, #applytoallow").hide();
	else $("#useragentspoof_os, #applytoallow").show();
	loadCheckbox("referrerspoofdenywhitelisted");
	if (localStorage['referrerspoof'] != 'same' && localStorage['referrerspoof'] != 'domain' && localStorage['referrerspoof'] != 'off') {
		$("#referrerspoof").val('custom');
		$("#customreferrer").show();
		$("#userref").val(localStorage['referrerspoof']);
	} else loadElement("referrerspoof");
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
	saveElement("timezone");
	saveCheckbox("keyboard");
	saveCheckbox("webbugs");
	saveCheckbox("utm");
	saveCheckbox("hashchecking");
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
	if (localStorage['annoyances'] == 'true') $("#annoyancesmode").removeAttr('disabled');
	else $("#annoyancesmode").attr('disabled', 'true');
	if (localStorage['useragentspoof'] != 'off') $("#useragentspoof_os, #applytoallow").show();
	else $("#useragentspoof_os, #applytoallow").hide();
	if (localStorage['referrerspoof'] != 'off') $("#applyreferrerspoofdenywhitelisted").show();
	else $("#applyreferrerspoofdenywhitelisted").hide();
	updateExport();
	bkg.refreshRequestTypes();
	bkg.initWebRTC();
	syncstatus = bkg.freshSync(1);
	if (syncstatus) {
		notification(chrome.i18n.getMessage("settingssavesync"));
	} else {
		notification(chrome.i18n.getMessage("settingssave"));
	}
}
function selectAll(id) {
	$("#"+id).select();
}
function settingsImport() {
	var error = "";
	var settings = $("#settingsimport").val().split("\n");
	if ($.trim($("#settingsimport").val()) == "") {
		notification(chrome.i18n.getMessage("pastesettings"));
		return false;
	}
	if (settings.length > 0) {
		$.each(settings, function(i, v) {
			if ($.trim(v) != "") {
				var settingentry = $.trim(v).split("|");
				if (settingnames.indexOf($.trim(settingentry[0])) != -1 && $.trim(settingentry[1]) != '') {
					if ($.trim(settingentry[0]) == 'whiteList' || $.trim(settingentry[0]) == 'blackList') {
						var listarray = $.trim(settingentry[1]).replace(/(\[|\]|")/g,"").split(",");
						if ($.trim(settingentry[0]) == 'whiteList' && listarray.toString() != '') localStorage['whiteList'] = JSON.stringify(listarray);
						else if ($.trim(settingentry[0]) == 'blackList' && listarray.toString() != '') localStorage['blackList'] = JSON.stringify(listarray);
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
	bkg.cacheLists();
	if (!error) {
		syncstatus = bkg.freshSync(0);
		if (syncstatus) {
			notification(chrome.i18n.getMessage("importsuccesssync"));
		} else {
			notification(chrome.i18n.getMessage("importsuccessoptions"));
		}
		bkg.refreshRequestTypes();
		bkg.initWebRTC();
		$("#settingsimport").val("");
	} else {
		bkg.freshSync(0);
		notification(chrome.i18n.getMessage("importsuccesscond")+error.slice(0, -2));
	}
}
function downloadtxt() {
	var textToWrite = $("#settingsexport").val();
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var fileNameToSaveAs = "scriptsafe-settings-"+new Date().toJSON()+".txt";
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	downloadLink.click();
	downloadLink.remove();
}
function updateExport() {
	settingnames = [];
	$("#settingsexport").val("");
	for (var i in localStorage) {
		if (i != "version" && i != "whiteListCount" && i != "blackListCount" && i.substr(0, 2) != "zb" && i.substr(0, 2) != "zw") {
			settingnames.push(i);
			$("#settingsexport").val($("#settingsexport").val()+i+"|"+localStorage[i]+"\n");
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
		notification(chrome.i18n.getMessage("domaininvalid"));
	} else if (!domain.match(/[a-z0-9]/g)) {
		notification(chrome.i18n.getMessage("domaininvalid2"));
	} else {
		if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && bkg.domainCheck(domain, 1) != '0')) && bkg.baddies(bkg.getDomain(domain), localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && bkg.baddies(bkg.getDomain(domain), localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
			notification(chrome.i18n.getMessage("domaininvalid3"));
		} else {
			var responseflag = bkg.domainHandler(domain, type);
			if (responseflag) {
				$('#url').val('');
				syncstatus = bkg.freshSync(2);
				if (syncstatus) {
					notification([chrome.i18n.getMessage("whitelisted"),chrome.i18n.getMessage("blacklisted")][type]+' '+domain+' and syncing in 30 seconds.');
				} else {
					notification([chrome.i18n.getMessage("whitelisted"),chrome.i18n.getMessage("blacklisted")][type]+' '+domain+'.');
				}
				listUpdate();
			} else {
				notification(domain+' not added as it already exists in the list or the entire domain has been '+[chrome.i18n.getMessage("whitelisted"),chrome.i18n.getMessage("blacklisted")][type]);
			}
			$('#url').focus();
		}
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
		syncstatus = bkg.freshSync(2);
		if (syncstatus) {
			notification('Successfully removed: '+domain+' and syncing in 30 seconds.');
		} else {
			notification('Successfully removed: '+domain);
		}
	}
	return false;
}
function domainMove(domain, mode) {
	var lingo;
	if (mode == '0') lingo = chrome.i18n.getMessage("whitelistlow");
	else if (mode == '1') lingo = chrome.i18n.getMessage("blacklistlow");
	if (confirm("Are you sure you want to move "+domain+" to the "+lingo+"?")) {
		bkg.domainHandler(domain, mode);
		listUpdate();
		syncstatus = bkg.freshSync(2);
		if (syncstatus) {
			notification([chrome.i18n.getMessage("whitelisted"),chrome.i18n.getMessage("blacklisted")][mode]+' '+domain+' and syncing in 30 seconds.');
		} else {
			notification([chrome.i18n.getMessage("whitelisted"),chrome.i18n.getMessage("blacklisted")][mode]+' '+domain);
		}
	}
	return false;
}
function topDomainAdd(domain, mode) {
	var lingo;
	var fpmode = false;
	if (mode == '0') lingo = chrome.i18n.getMessage("trustlow");
	else if (mode == '1') lingo = chrome.i18n.getMessage("distrustlow");
	else {
		lingo = chrome.i18n.getMessage("trustlow");
		fpmode = true;
	}
	if (domain && !domain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && !domain.match(/^(?:\[[A-Fa-f0-9:.]+\])$/g) && domain.indexOf('**.') != 0 && confirm("Are you sure you want to "+lingo+" "+bkg.getDomain(domain)+"?\r\n\r\Click OK will mean all subdomains on "+bkg.getDomain(domain)+" will be "+lingo+"ed, such as _."+bkg.getDomain(domain)+" and even _._._."+bkg.getDomain(domain)+".")) {
		bkg.topHandler(domain, mode);
		if (!fpmode) listUpdate();
		else fpListUpdate();
		bkg.freshSync(2);
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
		if ((type == '0' && $("#bulk strong").html() == chrome.i18n.getMessage("whitelist")+" "+chrome.i18n.getMessage("bulkimportcap")) || (type == '1' && $("#bulk strong").html() == chrome.i18n.getMessage("blacklist")+" "+chrome.i18n.getMessage("bulkimportcap"))) hidebulk();
	}
	$("#bulk textarea").focus();
	if (type == '0') {
		$("#bulk strong").html(chrome.i18n.getMessage("whitelist")+" "+chrome.i18n.getMessage("bulkimportcap"));
		$("#bulkbtn").val(chrome.i18n.getMessage("whitebind")).click(importbulkwhite);
	} else if (type == '1') {
		$("#bulk strong").html(chrome.i18n.getMessage("blacklist")+" "+chrome.i18n.getMessage("bulkimportcap"));
		$("#bulkbtn").val(chrome.i18n.getMessage("blackbind")).click(importbulkblack);
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
		syncstatus = bkg.freshSync(2);
		if (syncstatus) {
			notification('Domains imported successfully and syncing in 30 seconds');
		} else {
			notification('Domains imported successfully');
		}
		if ($("#bulk").is(":visible")) hidebulk();
		$("#bulk textarea").val("");
		$('#importerror').hide();
	} else {
		bkg.freshSync(2);
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
			if (whiteList[i][0] == '*' || whiteList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || whiteList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" class="domainMove i18_blacklistmove" title=\''+chrome.i18n.getMessage("blacklistmove")+'\' data-domain=\''+whiteList[i]+'\' data-mode="1">&#8644;</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'>X</a></div>'+whiteList[i]+'</div>';
			else whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+chrome.i18n.getMessage("trust")+' '+whiteList[i]+'\' data-domain=\''+whiteList[i]+'\' data-mode="0">'+chrome.i18n.getMessage("trust")+'</a> | <a href="javascript:;" class="domainMove i18_blacklistmove" title=\''+chrome.i18n.getMessage("blacklistmove")+'\' data-domain=\''+whiteList[i]+'\' data-mode="1">&#8644;</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'>X</a></div>'+whiteList[i]+'</div>';
		}
	}
	var blacklistCompiled = '';
	var blacklistLength = blackList.length;
	if (blacklistLength==0) blacklistCompiled = '[currently empty]';
	else {
		if (localStorage['domainsort'] == 'true') blackList = bkg.domainSort(blackList);
		else blackList.sort();
		for (var i in blackList) {
			if (blackList[i][0] == '*' || blackList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || blackList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" class="domainMove i18_whitelistmove" title=\''+chrome.i18n.getMessage("whitelistmove")+'\' data-domain=\''+blackList[i]+'\' data-mode="0">&#8644;</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'>X</a></div>'+blackList[i]+'</div>';
			else blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+chrome.i18n.getMessage("distrust")+' '+blackList[i]+'\' data-domain=\''+blackList[i]+'\' data-mode="1">'+chrome.i18n.getMessage("distrust")+'</a> | <a href="javascript:;" class="domainMove i18_whitelistmove" title=\''+chrome.i18n.getMessage("whitelistmove")+'\' data-domain=\''+blackList[i]+'\' data-mode="0">&#8644;</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'>X</a></div>'+blackList[i]+'</div>';
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
	var fpTypes = ['fpCanvas', 'fpCanvasFont', 'fpAudio', 'fpWebGL', 'fpBattery', 'fpDevice', 'fpGamepad', 'fpClientRectangles', 'fpClipboard'];
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
			if (fpList[i][0] == '*' || fpList[i].match(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) || fpList[i].match(/^(?:\[[A-Fa-f0-9:.]+\])(:[0-9]+)?$/g)) fpListCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="fpDomainRemover" rel=\''+fpList[i]+'\'>X</a></div>'+fpList[i]+'</div>';
			else fpListCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="fpDomainRemover" rel=\''+fpList[i]+'\'>X</a></div>'+fpList[i]+'</div>';
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
			notification('Settings saved and syncing in 30 seconds');
		} else {
			notification('Settings saved');
		}
	}
	return false;
}

!function(t){t.fn.stickyScroll=function(o){var e={init:function(o){function e(){return t(document).height()-i.container.offset().top-i.container.attr("offsetHeight")}function s(){return i.container.offset().top}function n(o){return t(o).attr("offsetHeight")}var i;return"auto"!==o.mode&&"manual"!==o.mode&&(o.container&&(o.mode="auto"),o.bottomBoundary&&(o.mode="manual")),i=t.extend({mode:"auto",container:t("body"),topBoundary:null,bottomBoundary:null},o),i.container=t(i.container),i.container.length?("auto"===i.mode&&(i.topBoundary=s(),i.bottomBoundary=e()),this.each(function(o){var c=t(this),a=t(window),r=Date.now()+o,l=n(c);c.data("sticky-id",r),a.bind("scroll.stickyscroll-"+r,function(){var o=t(document).scrollTop(),e=t(document).height()-o-l;e<=i.bottomBoundary?c.offset({top:t(document).height()-i.bottomBoundary-l}).removeClass("sticky-active").removeClass("sticky-inactive").addClass("sticky-stopped"):o>i.topBoundary?c.offset({top:t(window).scrollTop()}).removeClass("sticky-stopped").removeClass("sticky-inactive").addClass("sticky-active"):o<i.topBoundary&&c.css({position:"",top:"",bottom:""}).removeClass("sticky-stopped").removeClass("sticky-active").addClass("sticky-inactive")}),a.bind("resize.stickyscroll-"+r,function(){"auto"===i.mode&&(i.topBoundary=s(),i.bottomBoundary=e()),l=n(c),t(this).scroll()}),c.addClass("sticky-processed"),a.scroll()})):void(console&&console.log("StickyScroll: the element "+o.container+" does not exist, we're throwing in the towel"))},reset:function(){return this.each(function(){var o=t(this),e=o.data("sticky-id");o.css({position:"",top:"",bottom:""}).removeClass("sticky-stopped").removeClass("sticky-active").removeClass("sticky-inactive").removeClass("sticky-processed"),t(window).unbind(".stickyscroll-"+e)})}};return e[o]?e[o].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof o&&o?void(console&&console.log("Method"+o+" does not exist on jQuery.stickyScroll")):e.init.apply(this,arguments)}}(jQuery);