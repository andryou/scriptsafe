// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
'use strict';
var version = '1.0.9.3';
var bkg = chrome.extension.getBackgroundPage();
var syncstatus;
document.addEventListener('DOMContentLoaded', function () {
	loadOptions();
	$(".closepage").click(closeOptions);
	$(".refreshpage").click(function(e) { chrome.tabs.reload(); });
});
function closeOptions() {
	window.open('', '_self', '');window.close();
}
function padZeros(val) {
	return val<10 ? '0'+val : val;
}
function loadOptions() {
	$("#title").html("ScriptSafe v"+version);
	var allowedarr = JSON.parse(bkg.getRecents('allowed'));
	var blockedarr = JSON.parse(bkg.getRecents('blocked'));
	var blockedarrcount = blockedarr.length;
	var annoyances = localStorage['annoyances'];
	var annoyancesmode = localStorage['annoyancesmode'];
	var antisocial = localStorage['antisocial'];
	var mode = localStorage['mode'];
	$("#blockcount").text(blockedarrcount);
	if (blockedarrcount) {
		blockedarr.reverse();
		for (var i = 0; i < blockedarrcount; i++) {
			/*
				0 = time
				1 = request url
				2 = type
				3 = extracted request domain
				4 = full tab url
				5 = request domain check
				6 = tab domain check
				7 = baddiesCheck
				8 = fingerprint or not
			*/
			var entryTime = new Date(blockedarr[i][0]);
			var itemdomain = blockedarr[i][3];
			var fpitemdomain = blockedarr[i][3];
			if (blockedarr[i][2] == 'NOSCRIPT') itemdomain = 'no.script';
			else if (blockedarr[i][2] == 'WEBBUG') itemdomain = 'web.bug';
			else if (blockedarr[i][2] == 'Canvas Fingerprint') itemdomain = 'canvas.fingerprint';
			else if (blockedarr[i][2] == 'Canvas Font Access') itemdomain = 'canvas.font.access';
			else if (blockedarr[i][2] == 'Audio Fingerprint') itemdomain = 'audio.fingerprint';
			else if (blockedarr[i][2] == 'WebGL Fingerprint') itemdomain = 'webgl.fingerprint';
			else if (blockedarr[i][2] == 'Battery Fingerprint') itemdomain = 'battery.fingerprint';
			else if (blockedarr[i][2] == 'Device Enumeration') itemdomain = 'device.enumeration';
			else if (blockedarr[i][2] == 'Gamepad Enumeration') itemdomain = 'gamepad.enumeration';
			else if (blockedarr[i][2] == 'WebVR Enumeration') itemdomain = 'webvr.enumeration';
			else if (blockedarr[i][2] == 'Bluetooth Enumeration') itemdomain = 'bluetooth.enumeration';
			else if (blockedarr[i][2] == 'Spoofed Timezone') itemdomain = 'spoofed.timezone';
			else if (blockedarr[i][2] == 'Client Rectangles') itemdomain = 'client.rectangles';
			else if (blockedarr[i][2] == 'Clipboard Interference') itemdomain = 'clipboard.interference';
			else if (blockedarr[i][2] == 'Data URL') itemdomain = 'data.url';
			else if (blockedarr[i][2] == 'Browser Plugins Enumeration') itemdomain = 'browser.plugins.enumeration';
			var itemdomainfriendly = itemdomain.replace(/[.\[\]:]/g,"_");
			var fpitemdomainfriendly = fpitemdomain.replace(/[.\[\]:]/g,"_");
			var clearBtn = '';
			if (blockedarr[i][5] == '1') clearBtn = '<span class="box box4" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span>';
			if (blockedarr[i][2] == 'NOSCRIPT' || blockedarr[i][2] == 'WEBBUG') {
				$("#blocked > table > tbody").append('<tr rel="'+itemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+blockedarr[i][1].replace(/"/g, "'")+'">'+truncate(blockedarr[i][1])+'</td><td>'+blockedarr[i][2]+'</td><td title="'+blockedarr[i][4]+'">'+truncate(blockedarr[i][4])+'</td><td class="text-right" data-domain="'+itemdomain+'">&nbsp;</td>');
			} else if (blockedarr[i][7] && ((annoyances == 'true' && annoyancesmode == 'strict' && blockedarr[i][5] == '-1' && blockedarr[i][7] == '1') || (antisocial == 'true' && blockedarr[i][7] == '2'))) {
				var unwantedType = '';
				if (blockedarr[i][7] == '1') unwantedType = bkg.getLocale("unwanted");
				else if (blockedarr[i][7] == '2') unwantedType = bkg.getLocale("antisocialpopup");
				$("#blocked > table > tbody").append('<tr rel="'+itemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+blockedarr[i][1].replace(/"/g, "'")+'">'+truncate(blockedarr[i][1])+'</td><td>'+blockedarr[i][2]+'</td><td title="'+blockedarr[i][4]+'">'+truncate(blockedarr[i][4])+'</td><td class="text-right choices" data-domain="'+itemdomain+'" rel="'+blockedarr[i][3]+'"><span class="box box2 x_blacklist selected" rel="1" title="'+unwantedType+'">'+unwantedType+'</span></td>');
			} else if (blockedarr[i][8]) {
				$("#blocked > table > tbody").append('<tr rel="'+fpitemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+blockedarr[i][1].replace(/"/g, "'")+'">'+truncate(blockedarr[i][1])+'</td><td>'+blockedarr[i][2]+'</td><td title="'+blockedarr[i][4]+'">'+truncate(blockedarr[i][4])+'</td><td class="text-right fpchoices" data-domain="'+itemdomain+'" rel="'+blockedarr[i][3]+'">'+clearBtn+'<span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></td>');
			} else {
				var unwantedType = '';
				if (blockedarr[i][7] == '1') unwantedType = '<span class="box box2 x_blacklist selected" rel="1" title="'+bkg.getLocale("unwanted")+'">'+bkg.getLocale("unwanted")+'</span>';
				else if (blockedarr[i][7] == '2') unwantedType = '<span class="box box2 x_blacklist selected" rel="1" title="'+bkg.getLocale("antisocialpopup")+'">'+bkg.getLocale("antisocialpopup")+'</span>';
				$("#blocked > table > tbody").append('<tr rel="'+itemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+blockedarr[i][1].replace(/"/g, "'")+'">'+truncate(blockedarr[i][1])+'</td><td>'+blockedarr[i][2]+'</td><td title="'+blockedarr[i][4]+'">'+truncate(blockedarr[i][4])+'</td><td class="text-right choices" data-domain="'+itemdomain+'" rel="'+blockedarr[i][3]+'">'+clearBtn+'<span class="box box1 x_whitelist" rel="0" title="Allow Domain">'+bkg.getLocale("allow")+'</span><span class="box box1 x_trust" rel="3" title="Trust Entire Domain">'+bkg.getLocale("trust")+'</span>'+unwantedType+'<span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></td>');
			}
			if (mode == 'allow') {
				if (bkg.checkTemp(itemdomain)) {
					$("#blocked [rel='"+itemdomainfriendly+"'] .x_bypass").addClass("selected");
					$("#blocked [rel='"+itemdomainfriendly+"'] .box4").hide();
				}
			}
		}
	} else $("#blocked").hide();
	var allowedarrcount = allowedarr.length;
	$("#allowcount").text(allowedarrcount);
	if (allowedarrcount) {
		allowedarr.reverse();
		for (var i = 0; i < allowedarrcount; i++) {
			/*
				0 = time
				1 = request url
				2 = type
				3 = extracted request domain
				4 = full tab url
				5 = request domain list
				6 = baddiesCheck
				7 = fingerprint
			*/
			var entryTime = new Date(allowedarr[i][0]);
			var itemdomain = allowedarr[i][3];
			var fpitemdomain = allowedarr[i][3];
			if (allowedarr[i][2] == 'Canvas Fingerprint') itemdomain = 'canvas.fingerprint';
			else if (allowedarr[i][2] == 'Canvas Font Access') itemdomain = 'canvas.font.access';
			else if (allowedarr[i][2] == 'Audio Fingerprint') itemdomain = 'audio.fingerprint';
			else if (allowedarr[i][2] == 'WebGL Fingerprint') itemdomain = 'webgl.fingerprint';
			else if (allowedarr[i][2] == 'Battery Fingerprint') itemdomain = 'battery.fingerprint';
			else if (allowedarr[i][2] == 'Device Enumeration') itemdomain = 'device.enumeration';
			else if (allowedarr[i][2] == 'Gamepad Enumeration') itemdomain = 'gamepad.enumeration';
			else if (allowedarr[i][2] == 'WebVR Enumeration') itemdomain = 'webvr.enumeration';
			else if (allowedarr[i][2] == 'Bluetooth Enumeration') itemdomain = 'bluetooth.enumeration';
			else if (allowedarr[i][2] == 'Client Rectangles') itemdomain = 'client.rectangles';
			else if (allowedarr[i][2] == 'Clipboard Interference') itemdomain = 'clipboard.interference';
			else if (allowedarr[i][2] == 'Browser Plugins Enumeration') itemdomain = 'browser.plugins.enumeration';
			var itemdomainfriendly = itemdomain.replace(/[.\[\]:]/g,"_");
			var fpitemdomainfriendly = fpitemdomain.replace(/[.\[\]:]/g,"_");
			var clearBtn = '';
			if (allowedarr[i][5] == '0' || (allowedarr[i][7] && allowedarr[i][5] == '1')) clearBtn = '<span class="box box4" title="Clear Domain from List">'+bkg.getLocale("clear")+'</span>';
			if (allowedarr[i][7]) {
				$("#allowed > table > tbody").append('<tr rel="'+fpitemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+allowedarr[i][1].replace(/"/g, "'")+'">'+truncate(allowedarr[i][1])+'</td><td>'+allowedarr[i][2]+'</td><td title="'+allowedarr[i][4]+'">'+truncate(allowedarr[i][4])+'</td><td class="text-right fpchoices" data-domain="'+itemdomain+'" rel="'+allowedarr[i][3]+'">'+clearBtn+'<span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></td>');
			} else {
				$("#allowed > table > tbody").append('<tr rel="'+itemdomainfriendly+'"><td>'+padZeros(entryTime.getHours())+':'+padZeros(entryTime.getMinutes())+':'+padZeros(entryTime.getSeconds())+'</td><td title="'+allowedarr[i][1].replace(/"/g, "'")+'">'+truncate(allowedarr[i][1])+'</td><td>'+allowedarr[i][2]+'</td><td title="'+allowedarr[i][4]+'">'+truncate(allowedarr[i][4])+'</td><td class="text-right choices" data-domain="'+itemdomain+'" rel="'+allowedarr[i][3]+'">'+clearBtn+'<span class="box box2 x_blacklist" rel="1" title="Deny">'+bkg.getLocale("deny")+'</span><span class="box box2 x_trust" rel="4" title="Distrust Entire Domain">'+bkg.getLocale("distrust")+'</span><span class="box box3 x_bypass" rel="2" title="Temporary">'+bkg.getLocale("temp")+'</span></td>');
			}
			if (mode == 'block') {
				if (bkg.checkTemp(itemdomain)) {
					$("#allowed [rel='"+itemdomainfriendly+"'] .x_bypass").addClass("selected");
					$("#allowed [rel='"+itemdomainfriendly+"'] .box4").hide();
				}
			}
			if (allowedarr[i][7] && allowedarr[i][5] == '2') $('#allowed [rel="'+fpitemdomainfriendly+'"] [data-domain="'+itemdomain+'"] .x_bypass').addClass('selected');
		}
	} else $("#allowed").hide();
	$(".box").bind("click", handleclick);
}
function truncate(str) {
	if (str.length > 54)
		return str.substring(0, 54)+'...';
	return str;
}
function notification(msg) {
	$('#message').html(msg).stop().fadeIn("slow").delay(2000).fadeOut("slow")
}
function processCommand() {
	syncstatus = bkg.freshSync();
	if (syncstatus) {
		notification(bkg.getLocale("settingssavesync"));
	} else {
		notification(bkg.getLocale("settingssave"));
	}
}
function handleclick() {
	var listType = $(this).parent().parent().parent().parent().parent().attr('id');
	var url = $(this).parent().attr('rel');
	var val = $(this).attr('rel');
	var selected = $(this).hasClass("selected");
	var clear = $(this).hasClass("box4");
	if (val != 2 && selected) return;
	if ($(this).parent().hasClass("fpchoices")) {
		var fpType = $(this).parent().attr('data-domain');
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
		if (clear) {
			bkg.fpDomainHandler('**.'+bkg.getDomain(url), fpList, -1);
			bkg.fpDomainHandler(url, fpList, -1);
			$(this).hide();
			$("#"+listType+" .fpchoices[rel='"+url+"'][data-domain='"+fpType+"'] .box4").hide();
		} else {
			if (val < 2) {
				bkg.fpDomainHandler(url, fpList, -1, 1);
				chrome.runtime.sendMessage({reqtype: "save-fp", url: url, list: fpList});
				$(this).addClass("selected");
				$("#"+listType+" .fpchoices[rel='"+url+"'][data-domain='"+fpType+"'] .x_whitelist").addClass("selected");
			} else if (val == 2) {
				if (selected) {
					chrome.runtime.sendMessage({reqtype: "remove-temp-fp", url: url, list: fpList});
					$(this).removeClass("selected");
					$("#"+listType+" .fpchoices[rel='"+url+"'][data-domain='"+fpType+"'] .x_bypass").removeClass("selected");
				} else {
					chrome.runtime.sendMessage({reqtype: "temp-fp", url: url, list: fpList});
					$(this).addClass("selected");
					$("#"+listType+" .fpchoices[rel='"+url+"'][data-domain='"+fpType+"'] .x_bypass").addClass("selected");
				}
			}
		}
	} else {
		if (clear) {
			var trustType = bkg.trustCheck(url);
			if (trustType) {
				bkg.domainHandler('**.'+bkg.getDomain(url), 2);
				bkg.domainHandler('**.'+bkg.getDomain(url), 2, 1);
			} else {
				bkg.domainHandler(url, 2);
				bkg.domainHandler(url, 2, 1);
			}
			$(this).hide();
			$("#"+listType+" .choices[rel='"+url+"'] .box4").hide();
		} else {
			if (val < 2) {
				bkg.domainHandler(url, '2', '1');
				chrome.runtime.sendMessage({reqtype: "save", url: url, list: val});
				$(this).addClass("selected");
				$("#"+listType+" .choices[rel='"+url+"'] .x_whitelist").addClass("selected");
			} else if (val == 2) {
				if (selected) {
					chrome.runtime.sendMessage({reqtype: "remove-temp", url: url});
					$(this).removeClass("selected");
					$("#"+listType+" .choices[rel='"+url+"'] .x_bypass").removeClass("selected");
				} else {
					var mode;
					if (listType == 'blocked') mode = 'block';
					else mode = 'allow';
					chrome.runtime.sendMessage({reqtype: "temp", url: url, mode: mode});
					$(this).addClass("selected");
					$("#"+listType+" .choices[rel='"+url+"'] .x_bypass").addClass("selected");
				}
			} else if (val == 3) {
				bkg.topHandler(url, 0);
				val = 0;
				$(this).addClass("selected");
				$(".box1", $(this).parent()).addClass("selected");
			} else if (val == 4) {
				bkg.topHandler(url, 1);
				val = 1;
				$(this).addClass("selected");
				$(".box4", $(this).parent()).addClass("selected");
			}
		}
	}
	bkg.clearRecents();
	notification(bkg.getLocale("settingssave"));
}