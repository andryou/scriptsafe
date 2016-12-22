// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
document.addEventListener('DOMContentLoaded', function () {
	var version = '1.0.8.5';
	$("#title").html("ScriptSafe v"+version);
	$('#versionno').html(version);
	$("#loadoptionspage").click(function() { location.href='options.html'; });
	$("#closepage").click(function() { window.open('', '_self', '');window.close(); });
	$("#disableNotification").click(disableNotification);
	$("#loadoptionspage").val(chrome.i18n.getMessage("options"));
	$(".i18_options").html(chrome.i18n.getMessage("options"));
	$(".i18_support").html(chrome.i18n.getMessage("support"));
	$("#closepage").val(chrome.i18n.getMessage("close"));
	$("#disableNotification").val(chrome.i18n.getMessage("dontshowpage"));
});
function disableNotification() {
	if (confirm(chrome.i18n.getMessage("updatedisable"))) {
		localStorage['updatenotify'] = 'false';
		$('#message').html(chrome.i18n.getMessage("updatedisablemessage")).stop().fadeIn("slow").delay(2000).fadeOut("slow");
	}
}