// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
var savedBeforeloadEvents = new Array();
var timer;
var iframe = 0;
var timestamp = Math.round(new Date().getTime()/1000.0);
// initialize settings object with default settings (that are overwritten by the actual user-set values later on)
var SETTINGS = {
	"MODE": "block",
	"LISTSTATUS": "false",
	"DOMAINSTATUS": "-1",
	"WHITELIST": "",
	"BLACKLIST": "",
	"WHITELISTSESSION": "",
	"BLACKLISTSESSION": "",
	"SCRIPT": "true",
	"NOSCRIPT": "true",
	"OBJECT": "true",
	"APPLET": "true",
	"EMBED": "true",
	"IFRAME": "true",
	"FRAME": "true",
	"AUDIO": "true",
	"VIDEO": "true",
	"IMAGE": "false",
	"CANVAS": "false",
	"CANVASFONT": "false",
	"CLIENTRECTS": "false",
	"AUDIOBLOCK": "false",
	"BATTERY": "false",
	"WEBGL": "false",
	"KEYBOARD": "false",
	"WEBRTCDEVICE": "false",
	"GAMEPAD": "false",
	"TIMEZONE": "false",
	"ANNOYANCES": "false",
	"ANNOYANCESMODE": "relaxed",
	"ANTISOCIAL": "false",
	"PRESERVESAMEDOMAIN": "false",
	"WEBBUGS": "true",
	"LINKTARGET": "off",
	"EXPERIMENTAL": "0",
	"REFERRER": "true",
	"REFERRERSPOOFDENYWHITELISTED": "true",
	"PARANOIA": "true",
	"CLIPBOARD": "false",
};
document.addEventListener("beforeload", saveBeforeloadEvent, true); // eventually remove
if (window.self != window.top) iframe = 1;
chrome.extension.sendRequest({reqtype: "get-settings", iframe: iframe}, function(response) {
    document.removeEventListener("beforeload", saveBeforeloadEvent, true); // eventually remove
	if (typeof response === 'object' && response.status == 'true') {
		SETTINGS['MODE'] = response.mode;
		SETTINGS['ANNOYANCES'] = response.annoyances;
		SETTINGS['ANNOYANCESMODE'] = response.annoyancesmode;
		SETTINGS['ANTISOCIAL'] = response.antisocial;
		SETTINGS['WHITELIST'] = response.whitelist;
		SETTINGS['BLACKLIST'] = response.blacklist;	
		SETTINGS['WHITELISTSESSION'] = response.whitelistSession;
		SETTINGS['BLACKLISTSESSION'] = response.blackListSession;
		SETTINGS['SCRIPT'] = response.script;
		SETTINGS['PRESERVESAMEDOMAIN'] = response.preservesamedomain;
		SETTINGS['EXPERIMENTAL'] = response.experimental;
		SETTINGS['DOMAINSTATUS'] = domainCheck(window.location.href, 1);
		if (SETTINGS['EXPERIMENTAL'] == '0' && (((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && SETTINGS['DOMAINSTATUS'] == '1')) && response.enable == 'true' && SETTINGS['SCRIPT'] == 'true' && SETTINGS['DOMAINSTATUS'] != '0') || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && SETTINGS['DOMAINSTATUS'] != '0')) && baddies(window.location.hostname, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddies(window.location.hostname, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']) == '2'))))
			mitigate();
		SETTINGS['LISTSTATUS'] = response.enable;
		SETTINGS['NOSCRIPT'] = response.noscript;
		SETTINGS['OBJECT'] = response.object;
		SETTINGS['APPLET'] = response.applet;
		SETTINGS['EMBED'] = response.embed;
		SETTINGS['IFRAME'] = response.iframe;
		SETTINGS['FRAME'] = response.frame;
		SETTINGS['AUDIO'] = response.audio;
		SETTINGS['VIDEO'] = response.video;
		SETTINGS['IMAGE'] = response.image;
		SETTINGS['CANVAS'] = response.canvas;
		SETTINGS['CANVASFONT'] = response.canvasfont;
		SETTINGS['CLIENTRECTS'] = response.clientrects;
		SETTINGS['AUDIOBLOCK'] = response.audioblock;
		SETTINGS['BATTERY'] = response.battery;
		SETTINGS['WEBGL'] = response.webgl;
		SETTINGS['WEBRTCDEVICE'] = response.webrtcdevice;
		SETTINGS['GAMEPAD'] = response.gamepad;
		SETTINGS['TIMEZONE'] = response.timezone;
		SETTINGS['CLIPBOARD'] = response.clipboard;
		if (SETTINGS['CANVAS'] != 'false' && response.fp_canvas != '-1') SETTINGS['CANVAS'] = 'false';
		if (SETTINGS['CANVASFONT'] == 'true' && response.fp_canvasfont != '-1') SETTINGS['CANVASFONT'] = 'false';
		if (SETTINGS['AUDIOBLOCK'] == 'true' && response.fp_audio != '-1') SETTINGS['AUDIOBLOCK'] = 'false';
		if (SETTINGS['WEBGL'] == 'true' && response.fp_webgl != '-1') SETTINGS['WEBGL'] = 'false';
		if (SETTINGS['BATTERY'] == 'true' && response.fp_battery != '-1') SETTINGS['BATTERY'] = 'false';
		if (SETTINGS['WEBRTCDEVICE'] == 'true' && response.fp_device != '-1') SETTINGS['WEBRTCDEVICE'] = 'false';
		if (SETTINGS['GAMEPAD'] == 'true' && response.fp_gamepad != '-1') SETTINGS['GAMEPAD'] = 'false';
		if (SETTINGS['CLIENTRECTS'] == 'true' && response.fp_clientrectangles != '-1') SETTINGS['CLIENTRECTS'] = 'false';
		if (SETTINGS['CLIPBOARD'] == 'true' && response.fp_clipboard != '-1') SETTINGS['CLIPBOARD'] = 'false';
		if (SETTINGS['CANVAS'] != 'false' || SETTINGS['CANVASFONT'] == 'true' || SETTINGS['CLIENTRECTS'] == 'true' || SETTINGS['AUDIOBLOCK'] == 'true' || SETTINGS['BATTERY'] == 'true' || SETTINGS['WEBGL'] == 'true' || SETTINGS['WEBRTCDEVICE'] == 'true' || SETTINGS['GAMEPAD'] == 'true' || SETTINGS['TIMEZONE'] != 'false' || SETTINGS['CLIPBOARD'] == 'true') {
			fingerprintProtection();
		}
		SETTINGS['WEBBUGS'] = response.webbugs;
		SETTINGS['LINKTARGET'] = response.linktarget;
		SETTINGS['REFERRER'] = response.referrer;
		SETTINGS['REFERRERSPOOFDENYWHITELISTED'] = response.referrerspoofdenywhitelisted;
		SETTINGS['PARANOIA'] = response.paranoia;
		SETTINGS['KEYBOARD'] = response.keyboard;
		$(document).ready(function() {
			loaded();
			if (SETTINGS['KEYBOARD'] == 'true') {
				$('div, :input').keyup(randomDelay);
				$('div, :input').keydown(randomDelay);
			}
			if (SETTINGS['CLIPBOARD'] == 'true') {
				clipboardProtect(window);
				clipboardProtect(document);
			}
		});
		document.addEventListener("beforeload", block, true); // eventually remove
		for (var i = 0; i < savedBeforeloadEvents.length; i++) // eventually remove
			block(savedBeforeloadEvents[i]); // eventually remove
	}
	delete savedBeforeloadEvents; // eventually remove
});
function fingerprintProtection() {
	injectAnon(function(canvas, canvasfont, audioblock, battery, webgl, webrtcdevice, gamepad, timezone, clientrects, clipboard){
		function processFunctions(scope) {
			/* Canvas */
			if (canvas != 'false') {
				var fakecanvas = scope.document.createElement('canvas');
				fakecanvas.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas';
				if (canvas == 'random') {
					var fakewidth = fakecanvas.width = Math.floor(Math.random() * 999) + 1;
					var fakeheight = fakecanvas.height = Math.floor(Math.random() * 999) + 1;
				}
				var canvas_a = scope.HTMLCanvasElement;
				var origToDataURL = canvas_a.prototype.toDataURL;
				var origToBlob = canvas_a.prototype.toBlob;
				canvas_a.prototype.toDataURL = function() {
					fakecanvas.title = 'toDataURL';
					document.documentElement.appendChild(fakecanvas);
					if (canvas == 'block') return false;
					else if (canvas == 'blank') {
						fakecanvas.width = this.width;
						fakecanvas.height = this.height;
						return origToDataURL.apply(fakecanvas, arguments);
					} else if (canvas == 'random') {
						return origToDataURL.apply(fakecanvas, arguments);
					}
				};
				canvas_a.prototype.toBlob = function() {
					fakecanvas.title = 'toBlob';
					document.documentElement.appendChild(fakecanvas);
					if (canvas == 'block') return false;
					else if (canvas == 'blank') {
						fakecanvas.width = this.width;
						fakecanvas.height = this.height;
						return origToBlob.apply(fakecanvas, arguments);
					} else if (canvas == 'random') {
						return origToBlob.apply(fakecanvas, arguments);
					}
				};
				var canvas_b = scope.CanvasRenderingContext2D;
				var origGetImageData = canvas_b.prototype.getImageData;
				canvas_b.prototype.getImageData = function() {
					fakecanvas.title = 'getImageData';
					document.documentElement.appendChild(fakecanvas);
					if (canvas == 'block') return false;
					else if (canvas == 'blank') {
						fakecanvas.width = this.width;
						fakecanvas.height = this.height;
						return origGetImageData.apply(fakecanvas.getContext('2d'), arguments);
					} else if (canvas == 'random') {
						return origGetImageData.apply(fakecanvas.getContext('2d'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1]);
					}
				}
				var origGetLineDash = canvas_b.prototype.getLineDash;
				canvas_b.prototype.getLineDash = function() {
					fakecanvas.title = 'getLineDash';
					document.documentElement.appendChild(fakecanvas);
					if (canvas == 'block') return false;
					else if (canvas == 'blank') {
						fakecanvas.width = this.width;
						fakecanvas.height = this.height;
						return origGetLineDash.apply(fakecanvas.getContext('2d'), [0, 0]);
					} else if (canvas == 'random') {
						return origGetLineDash.apply(fakecanvas.getContext('2d'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1]);
					}
				}
				var canvas_c = scope.WebGLRenderingContext;
				var origReadPixels = canvas_c.prototype.readPixels;
				canvas_c.prototype.readPixels = function() {
					fakecanvas.title = 'readPixels';
					document.documentElement.appendChild(fakecanvas);
					if (canvas == 'block') return false;
					else if (canvas == 'blank') {
						fakecanvas.width = this.width;
						fakecanvas.height = this.height;
						return origReadPixels.apply(fakecanvas.getContext('webgl'), arguments);
					} else if (canvas == 'random') {
						return origReadPixels.apply(fakecanvas.getContext('webgl'), [Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, Math.floor(Math.random() * fakewidth) + 1, Math.floor(Math.random() * fakeheight) + 1, arguments[4], arguments[5], arguments[6]]);
					}
				}
			}
			/* Audio Block */
			if (audioblock == 'true') {
				var audioblock_triggerblock = scope.document.createElement('div');
				audioblock_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio';
				var audioblock_a = scope.AudioBuffer;
				audioblock_a.prototype.copyFromChannel = function() {
					audioblock_triggerblock.title = 'copyFromChannel';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				audioblock_a.prototype.getChannelData = function() {
					audioblock_triggerblock.title = 'getChannelData';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				var audioblock_b = scope.AnalyserNode;
				audioblock_b.prototype.getFloatFrequencyData = function() {
					audioblock_triggerblock.title = 'getFloatFrequencyData';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				audioblock_b.prototype.getByteFrequencyData = function() {
					audioblock_triggerblock.title = 'getByteFrequencyData';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				audioblock_b.prototype.getFloatTimeDomainData = function() {
					audioblock_triggerblock.title = 'getFloatTimeDomainData';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				audioblock_b.prototype.getByteTimeDomainData = function() {
					audioblock_triggerblock.title = 'getByteTimeDomainData';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				var audioblock_c = scope;
				audioblock_c.AudioContext = function() {
					audioblock_triggerblock.title = 'AudioContext';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
				audioblock_c.webkitAudioContext = function() {
					audioblock_triggerblock.title = 'webkitAudioContext';
					document.documentElement.appendChild(audioblock_triggerblock);
					return false;
				}
			}
			/* Canvas Font */
			if (canvasfont == 'true') {
				var canvasfont_triggerblock = scope.document.createElement('div');
				canvasfont_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont';
				var canvasfont_a = scope.CanvasRenderingContext2D;
				canvasfont_a.prototype.measureText = function() {
					canvasfont_triggerblock.title = 'measureText';
					document.documentElement.appendChild(canvasfont_triggerblock);
					return false;
				}
			}
			/* Battery */
			if (battery == 'true') {
				var battery_triggerblock = scope.document.createElement('div');
				battery_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery';
				var battery_a = scope.navigator;
				battery_a.getBattery = function() {
					battery_triggerblock.title = 'getBattery';
					document.documentElement.appendChild(battery_triggerblock);
					return void(0);
				}
			}
			/* WebGL */
			if (webgl == 'true') {
				var webgl_triggerblock = scope.document.createElement('div');
				webgl_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl';
				var webgl_a = scope.WebGLRenderingContext;
				webgl_a.getSupportedExtensions = function() {
					webgl_triggerblock.title = 'getSupportedExtensions';
					document.documentElement.appendChild(webgl_triggerblock);
					return false;
				}
				webgl_a.getParameter = function() {
					webgl_triggerblock.title = 'getParameter';
					document.documentElement.appendChild(webgl_triggerblock);
					return false;
				}
				webgl_a.getContextAttributes = function() {
					webgl_triggerblock.title = 'getContextAttributes';
					document.documentElement.appendChild(webgl_triggerblock);
					return false;
				}
				webgl_a.getShaderPrecisionFormat = function() {
					webgl_triggerblock.title = 'getShaderPrecisionFormat';
					document.documentElement.appendChild(webgl_triggerblock);
					return false;
				}
				webgl_a.getExtension = function() {
					webgl_triggerblock.title = 'getExtension';
					document.documentElement.appendChild(webgl_triggerblock);
					return false;
				}
			}
			/* WebRTC */
			if (webrtcdevice == 'true') {
				var webrtc_triggerblock = scope.document.createElement('div');
				webrtc_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc';
				var webrtc_a = scope.MediaStreamTrack;
				webrtc_a.getSources = function() {
					webrtc_triggerblock.title = 'getSources';
					document.documentElement.appendChild(webrtc_triggerblock);
					return false;
				}
				webrtc_a.getMediaDevices = function() {
					webrtc_triggerblock.title = 'getMediaDevices';
					document.documentElement.appendChild(webrtc_triggerblock);
					return false;
				}
				var webrtc_b = scope.navigator.mediaDevices;
				webrtc_b.enumerateDevices = function() {
					webrtc_triggerblock.title = 'enumerateDevices';
					document.documentElement.appendChild(webrtc_triggerblock);
					return false;
				}
			}
			/* Gamepad */
			if (gamepad == 'true') {
				var gamepad_triggerblock = scope.document.createElement('div');
				gamepad_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad';
				var gamepad_a = scope.navigator;
				gamepad_a.getGamepads = function() {
					gamepad_triggerblock.title = 'getGamepads';
					document.documentElement.appendChild(gamepad_triggerblock);
					return false;
				}
			}
			/* Client Rectangles */
			if (clientrects == 'true') {
				var clientrects_triggerblock = scope.document.createElement('div');
				clientrects_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clientrects';
				Element.prototype.getClientRects = function() {
					clientrects_triggerblock.title = 'getClientRects';
					document.documentElement.appendChild(clientrects_triggerblock);
					return [{'top': 0, 'bottom': 0, 'left': 0, 'right': 0, 'height': 0, 'width': 0}];
				}
			}
			/* Timezone */
			if (timezone != 'false') {
				var timezone_triggerblock = scope.document.createElement('div');
				timezone_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_timezone';
				var timezone_a = scope.Date;
				timezone_a.prototype.getTimezoneOffset = function() {
					timezone_triggerblock.title = 'getTimezoneOffset';
					document.documentElement.appendChild(timezone_triggerblock);
					if (timezone == 'random') return ['720','660','600','570','540','480','420','360','300','240','210','180','120','60','0','-60','-120','-180','-210','-240','-270','-300','-330','-345','-360','-390','-420','-480','-510','-525','-540','-570','-600','-630','-660','-720','-765','-780','-840'][Math.floor(Math.random() * 39)];
					return timezone;
				}
			}
			/* Clipboard */
			if (clipboard == 'true') {
				var clipboard_triggerblock = scope.document.createElement('div');
				clipboard_triggerblock.className = 'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clipboard';
				var clipboard_a = document;
				var origExecCommand = clipboard_a.execCommand;
				clipboard_a.execCommand = function() {
					clipboard_triggerblock.title = 'execCommand';
					document.documentElement.appendChild(clipboard_triggerblock);
					if (arguments[0] == 'cut' || arguments[0] == 'copy') return false;
					return origExecCommand.apply(this, arguments);
				};
			}
		}
		processFunctions(window);
		var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'), idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
		Object.defineProperties(HTMLIFrameElement.prototype, {
			contentWindow: {
				get: function() {
					var frame = iwin.apply(this);
					if (this.src && this.src.indexOf('//') != -1 && location.host != this.src.split('/')[2]) return frame;
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return frame;
				}
			},
			contentDocument: {
				get: function() {
					if (this.src && this.src.indexOf('//') != -1 && location.host != this.src.split('/')[2]) return idoc.apply(this);
					var frame = iwin.apply(this);
					try { frame.HTMLCanvasElement } catch (err) { /* do nothing*/ }
					processFunctions(frame);
					return idoc.apply(this);
				}
			}
		});
	}, "'"+SETTINGS['CANVAS']+"','"+SETTINGS['CANVASFONT']+"','"+SETTINGS['AUDIOBLOCK']+"','"+SETTINGS['BATTERY']+"','"+SETTINGS['WEBGL']+"','"+SETTINGS['WEBRTCDEVICE']+"','"+SETTINGS['GAMEPAD']+"','"+SETTINGS['TIMEZONE']+"','"+SETTINGS['CLIENTRECTS']+"','"+SETTINGS['CLIPBOARD']+"'");
}
function clipboardProtect(el) {
    el.oncontextmenu = null;
    el.onselectstart = null;
    el.onmousedown = null;
    el.oncopy = null;
    el.oncut = null;
    el.onpaste = null;
	el.addEventListener('contextmenu', function(e) { e.returnValue = true; });
	el.addEventListener('selectstart', function(e) { e.returnValue = true; });
	el.addEventListener('mousedown', function(e) { e.returnValue = true; });
	el.addEventListener('copy', function(e) { e.returnValue = true; });
	el.addEventListener('cut', function(e) { e.returnValue = true; });
}
function loaded() {
	ScriptSafe();
	new MutationObserver(ScriptSafe).observe(document.querySelector("body"), { childList: true, subtree : true, attributes: false, characterData : false });
}
function ScriptSafe() {
	if (SETTINGS['LINKTARGET'] != 'off') {
		var linktrgt;
		if (SETTINGS['LINKTARGET'] == 'same') linktrgt = '_self';
		else if (SETTINGS['LINKTARGET'] == 'new') linktrgt = '_blank';
		$("a[target!='"+linktrgt+"']").attr("target", linktrgt);
	}
	if (SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && (SETTINGS['DOMAINSTATUS'] != '0' || SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) {
		$("a[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (thirdParty(elSrc)) { $(this).attr("rel","noreferrer"); } $(this).attr("data-ss"+timestamp,'1'); });
	}
	if (SETTINGS['CANVAS'] != 'false') {
		$("canvas.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Canvas Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['CLIPBOARD'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clipboard").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Clipboard Interference'}); $(this).remove(); });
	}
	if (SETTINGS['CANVASFONT'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Canvas Font Access'}); $(this).remove(); });
	}
	if (SETTINGS['AUDIOBLOCK'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Audio Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['WEBGL'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'WebGL Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['BATTERY'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Battery Fingerprint'}); $(this).remove(); });
	}
	if (SETTINGS['WEBRTCDEVICE'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Device Enumeration'}); $(this).remove(); });
	}
	if (SETTINGS['GAMEPAD'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Gamepad Enumeration'}); $(this).remove(); });
	}
	if (SETTINGS['CLIENTRECTS'] == 'true') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clientrects").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Client Rectangles'}); $(this).remove(); });
	}
	if (SETTINGS['TIMEZONE'] != 'false') {
		$("div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_timezone").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: window.location.href+" ("+$(this).attr('title')+"())", node: 'Spoofed Timezone'}); $(this).remove(); });
	}
	if (SETTINGS['NOSCRIPT'] == 'true' && SETTINGS['LISTSTATUS'] == 'true') {
		$("noscript").each(function() { chrome.extension.sendRequest({reqtype: "update-blocked", src: $(this).html(), node: 'NOSCRIPT'}); $(this).remove(); });
	}
	if (SETTINGS['APPLET'] == 'true') $("applet[data-ss"+timestamp+"!='1']").each(function() { var elSrc = $(this).attr('code'); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'APPLET'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'APPLET'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['VIDEO'] == 'true') $("video[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'VIDEO'}); removeMedia($(this)); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'VIDEO'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['AUDIO'] == 'true') $("audio[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'AUDIO'}); removeMedia($(this)); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'AUDIO'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['IFRAME'] == 'true') $("iframe[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'FRAME'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'FRAME'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['OBJECT'] == 'true') $("object[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'OBJECT'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'OBJECT'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['EMBED'] == 'true') $("embed[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'EMBED'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'EMBED'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['IMAGE'] == 'true') $("picture[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'IMAGE'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'IMAGE'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	if (SETTINGS['IMAGE'] == 'true') $("img[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'IMAGE'}); $(this).remove(); } else { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: 'IMAGE'}); $(this).attr("data-ss"+timestamp,'1'); } } });
	/* Fallback Inline Script Handling */
	if (SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == '0') {
		clearUnloads();
		$("script[data-ss"+timestamp+"!='1']").each(function() { var elSrc = getElSrc(this); if (elSrc) { elSrc = relativeToAbsoluteUrl(elSrc); if (postLoadCheck(elSrc.toLowerCase())) { chrome.extension.sendRequest({reqtype: "update-blocked", src: elSrc, node: 'SCRIPT'}); $(this).remove(); } else { if (elSrc.substr(0,4) == 'http') { chrome.extension.sendRequest({reqtype: "update-allowed", src: elSrc, node: "SCRIPT"}); $(this).attr("data-ss"+timestamp,'1'); } } } });
		if ((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' || (SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && SETTINGS['DOMAINSTATUS'] == '1'))) {
			$("a[href^='javascript']").attr("href","javascript:;");
			$("[onClick]").removeAttr("onClick");
			$("[onAbort]").removeAttr("onAbort");
			$("[onBlur]").removeAttr("onBlur");
			$("[onChange]").removeAttr("onChange");
			$("[onDblClick]").removeAttr("onDblClick");
			$("[onDragDrop]").removeAttr("onDragDrop");
			$("[onError]").removeAttr("onError");
			$("[onFocus]").removeAttr("onFocus");
			$("[onKeyDown]").removeAttr("onKeyDown");
			$("[onKeyPress]").removeAttr("onKeyPress");
			$("[onKeyUp]").removeAttr("onKeyUp");
			$("[onLoad]").removeAttr("onLoad");
			$("[onMouseDown]").removeAttr("onMouseDown");
			$("[onMouseMove]").removeAttr("onMouseMove");
			$("[onMouseOut]").removeAttr("onMouseOut");
			$("[onMouseOver]").removeAttr("onMouseOver");
			$("[onMouseUp]").removeAttr("onMouseUp");
			$("[onMove]").removeAttr("onMove");
			$("[onReset]").removeAttr("onReset");
			$("[onResize]").removeAttr("onResize");
			$("[onSelect]").removeAttr("onSelect");
			$("[onSubmit]").removeAttr("onSubmit");
			$("[onUnload]").removeAttr("onUnload");
		}
	}
}
function postLoadCheck(elSrc) {
	if (elSrc.substring(0,4) != 'http') return false;
	var domainCheckStatus;
	var thirdPartyCheck;
	var elementStatusCheck;
	var baddiesCheck = baddies(elSrc, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL'], 2);
	if (SETTINGS['DOMAINSTATUS'] == '1' || (SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true' && SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) {
		elementStatusCheck = true;
		thirdPartyCheck = true;
	} else {
		domainCheckStatus = domainCheck(elSrc, 1);
		var elementDomain = extractDomainFromURL(elSrc);
		if ((domainCheckStatus == '0' && !(SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true')) || (SETTINGS['preservesamedomain'] == 'strict' && elementDomain == window.location.hostname)) thirdPartyCheck = false;
		else if (SETTINGS['preservesamedomain'] == 'strict' && elementDomain != window.location.hostname) thirdPartyCheck = true;
		else thirdPartyCheck = thirdParty(elSrc);
		if ((SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && SETTINGS['MODE'] == 'block'))) || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	if (elementStatusCheck && ((SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) || SETTINGS['PRESERVESAMEDOMAIN'] == 'false'))
		return true;
	return false;
}
function domainCheck(domain, req) {
	if (!domain) return '-1';
	if (req === undefined) {
		var baddiesCheck = baddies(domain, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']);
		if ((SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'strict' && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2')) return '1';
	}
	var domainname = extractDomainFromURL(domain);
	if (req != '2') {
		if (SETTINGS['MODE'] == 'block' && in_array(domainname, SETTINGS['WHITELISTSESSION'])) return '0';
		if (SETTINGS['MODE'] == 'allow' && in_array(domainname, SETTINGS['BLACKLISTSESSION'])) return '1';
	}
	if (in_array(domainname, SETTINGS['WHITELIST'])) return '0';
	if (in_array(domainname, SETTINGS['BLACKLIST'])) return '1';
	if (req === undefined) {
		if (SETTINGS['ANNOYANCES'] == 'true' && SETTINGS['ANNOYANCESMODE'] == 'relaxed' && baddiesCheck) return '1';
	}
	return '-1';
}
function relativeToAbsoluteUrl(url) { // credit: NotScripts
	if (!url || url.indexOf('://') != -1)
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
function removeMedia($el) {
	$el[0].pause();
	$el[0].src = '';
	$el.children('source').prop('src', '');
	$el.load();
	//$el.hide();
	$el.remove().length = 0;
};
function getElSrc(el) {
	var reStartWProtocol = /^[^\.\/:]+:\/\//i; // credit: NotScripts
	switch (el.nodeName.toUpperCase()) {
		case 'PICTURE':
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].srcset) return plist[i].srcset;
			}
			plist = el.getElementsByTagName('img');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
		case 'AUDIO':
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
			}
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
		case 'VIDEO':
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
			}
			var plist = el.getElementsByTagName('source');
			for (var i=0; i < plist.length; i++) {
				if (plist[i].src) return plist[i].src;
			}
			return window.location.href;
			break;
		case 'OBJECT': // credit: NotScripts
			if (el.codeBase) codeBase = el.codeBase;	
			if (el.data) {
				if (reStartWProtocol.test(el.data)) return el.data;
				else return codeBase;				
			}
			var plist = el.getElementsByTagName('param');
			for (var i=0; i < plist.length; i++) {
				var paramName = plist[i].name.toLowerCase();
				if (paramName === 'movie' || paramName === 'src' || paramName === 'codebase' || paramName === 'data')
					return plist[i].value;
				else if (paramName === 'code' || paramName === 'url')
					return plist[i].value;
			}
			return window.location.href;
			break;
		case 'EMBED': // credit: NotScripts
			var codeBase = window.location.href;
			if (el.codeBase) codeBase = el.codeBase;
			if (el.src)	{
				if (reStartWProtocol.test(el.src)) return el.src;
				else return codeBase;
			}
			if (el.data) {
				if (reStartWProtocol.test(el.data)) return el.data;
				else return codeBase;				
			}
			if (el.code) {
				if (reStartWProtocol.test(el.code)) return el.code;
				else return codeBase;			
			}
			return window.location.href;
			break;
		case 'A':
			return el.href;
			break;
		default:
			return el.src;
			break;
	}
}
function randomDelay() {
	var zzz = (Date.now() + (Math.floor(Math.random() * 100) + 10));
	while (Date.now() < zzz) {};
}
function injectAnon(f, val) {
    var script = document.createElement("script");
	val = val || '';
	script.type = "text/javascript";
    script.textContent = "(" + f + ")("+val+");";
    document.documentElement.appendChild(script);
}
/* Fallback Inline Script Handling (if Chrome doesn't support chrome.webRequest API) / */
function mitigate() { // credit: NotScripts
	injectAnon(function(){
		for (var i in window) {
			try {
				var jsType = typeof window[i];
				switch (jsType.toUpperCase()) {					
					case "FUNCTION": 
						if (window[i] !== window.location) {
							if (window[i] === window.open || (window.showModelessDialog && window[i] === window.showModelessDialog))
								window[i] = function(){return true;};
							else if (window[i] === window.onbeforeunload)
								window.onbeforeunload = null;
							else if (window[i] === window.onunload)
								window.onunload = null;								
							else
								window[i] = function(){return "";};
						}
						break;							
				}			
			} catch(err) {}		
		}
		for (var i in document) {
			try {
				var jsType = typeof document[i];
				switch (jsType.toUpperCase()) {					
					case "FUNCTION":
						document[i] = function(){return "";};
						break;					
				}			
			} catch(err) {}		
		}
		try {
			eval = function(){return "";};				
			unescape = function(){return "";};
			String = function(){return "";};
			parseInt = function(){return "";};
			parseFloat = function(){return "";};
			Number = function(){return "";};
			isNaN = function(){return "";};
			isFinite = function(){return "";};
			escape = function(){return "";};
			encodeURIComponent = function(){return "";};
			encodeURI = function(){return "";};
			decodeURIComponent = function(){return "";};
			decodeURI = function(){return "";};
			Array = function(){return "";};
			Boolean = function(){return "";};
			Date = function(){return "";};
			Math = function(){return "";};
			Number = function(){return "";};
			RegExp = function(){return "";};
			var oNav = navigator;
			navigator = function(){return "";};
			oNav = null;			
		} catch(err) {}
	});
}
function clearUnloads() { // credit: NotScripts
	clearTimeout(timer);
	var keepGoing = (window.onbeforeunload || window.onunload);
	window.onbeforeunload = null;
	window.onunload = null;
	if (keepGoing) timer = setTimeout("clearUnloads()", 5000);
}
/* / Fallback Inline Script Handling */
/* Deprecated beforeload Handling / */
function saveBeforeloadEvent(e) {
	savedBeforeloadEvents.push(e);
}
function block(event) {
	var el = event.target;
	var elSrc = getElSrc(el);
	if (!elSrc) return;
	var elType = el.nodeName.toUpperCase();
	if (!(elType == "A" || elType == "IFRAME" || elType == "FRAME" || (elType == "SCRIPT" && SETTINGS['EXPERIMENTAL'] == '0') || elType == "EMBED" || elType == "OBJECT" || elType == "IMG")) return;
	elSrc = elSrc.toLowerCase();
	var absoluteUrl = relativeToAbsoluteUrl(elSrc);
	if (absoluteUrl.substr(0,4) != 'http') return;
	var thirdPartyCheck;
	var elementStatusCheck;
	var domainCheckStatus;
	var elWidth = $(el).attr('width');
	var elHeight = $(el).attr('height');
	var elStyle = $(el).attr('style');
	var baddiesCheck = baddies(absoluteUrl, SETTINGS['ANNOYANCESMODE'], SETTINGS['ANTISOCIAL']);
	if (SETTINGS['DOMAINSTATUS'] == '1' || (SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true' && SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) {
		elementStatusCheck = true;
		thirdPartyCheck = true;
		domainCheckStatus = '1';
	} else {
		domainCheckStatus = domainCheck(absoluteUrl, 1);
		var elementDomain = extractDomainFromURL(absoluteUrl);
		if ((domainCheckStatus == '0' && !(SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true')) || (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' && elementDomain == window.location.hostname)) thirdPartyCheck = false;
		else if (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' && elementDomain != window.location.hostname) thirdPartyCheck = true;
		else thirdPartyCheck = thirdParty(absoluteUrl);
		if ((SETTINGS['DOMAINSTATUS'] == '-1' && SETTINGS['MODE'] == 'block' && SETTINGS['PARANOIA'] == 'true') || (domainCheckStatus != '0' && (domainCheckStatus == '1' || (domainCheckStatus == '-1' && SETTINGS['MODE'] == 'block'))) || ((SETTINGS['ANNOYANCES'] == 'true' && (SETTINGS['ANNOYANCESMODE'] == 'strict' || (SETTINGS['ANNOYANCESMODE'] == 'relaxed' && domainCheckStatus != '0'))) && baddiesCheck == '1') || (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == '2'))
			elementStatusCheck = true;
		else elementStatusCheck = false;
	}
	if (elementStatusCheck && (
		(
			(
				(
					(elType == "IFRAME" && SETTINGS['IFRAME'] == 'true')
					|| (elType == "FRAME" && SETTINGS['FRAME'] == 'true')
					|| (elType == "EMBED" && SETTINGS['EMBED'] == 'true')
					|| (elType == "OBJECT" && SETTINGS['OBJECT'] == 'true')
					|| (elType == "SCRIPT" && SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == '0')
					|| (elType == "VIDEO" && SETTINGS['VIDEO'] == 'true')
					|| (elType == "AUDIO" && SETTINGS['AUDIO'] == 'true')
					|| (elType == "IMG" && SETTINGS['IMAGE'] == 'true')
					|| (elType == "A" && (SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && (SETTINGS['DOMAINSTATUS'] != '0' || SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))))
				)
				&& (
					(SETTINGS['PRESERVESAMEDOMAIN'] != 'false' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck))
					|| SETTINGS['PRESERVESAMEDOMAIN'] == 'false'
				)
				
			)
		)
		|| (
			SETTINGS['WEBBUGS'] == 'true'
			&& (elType == "IMG" || elType == "IFRAME" ||  elType == "FRAME" || elType == "EMBED" || elType == "OBJECT")
			&& (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
			&& (
				(typeof elWidth !== 'undefined' && elWidth <= 5 && typeof elHeight !== 'undefined' && elHeight <= 5)
				|| (typeof elStyle !== 'undefined' && elStyle.match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i))
			)
		)
		|| (
			(SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && (SETTINGS['DOMAINSTATUS'] != '0' || SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
	))) {
			if ((SETTINGS['REFERRER'] == 'alldomains' || (SETTINGS['REFERRER'] == 'true' && (SETTINGS['DOMAINSTATUS'] != '0' || SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) && elType == "A" && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) {
				$(el).attr("rel","noreferrer");
			} else {
				event.preventDefault();
				if (SETTINGS['WEBBUGS'] == 'true' && (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck) && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "IMG") && ((typeof elWidth !== 'undefined' && elWidth <= 5 && typeof elHeight !== 'undefined' && elHeight <= 5) || (typeof elStyle !== 'undefined' && elStyle.match(/(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i)))) {
					elType = "WEBBUG";
				}
				chrome.extension.sendRequest({reqtype: "update-blocked", src: absoluteUrl, node: elType});
				if (elType == 'VIDEO' || elType == 'AUDIO') removeMedia($el);
				else $(el).remove();
			}
		} else {
			if (SETTINGS['EXPERIMENTAL'] == '0' && (elType == "IFRAME" || elType == "FRAME" || elType == "EMBED" || elType == "OBJECT" || elType == "SCRIPT")) {
				chrome.extension.sendRequest({reqtype: "update-allowed", src: absoluteUrl, node: elType});
			}
		}
}
/* / Deprecated beforeload Handling */
