document.addEventListener('DOMContentLoaded', function () {
	var version = (function () {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
		xhr.send(null);
		return JSON.parse(xhr.responseText).version;
	}());
	$("#title").html("ScriptSafe v"+version);
	$('#versionno').html(version);
	$("#loadoptionspage").click(function() { location.href='options.html'; });
	$("#closepage").click(function() { window.open('', '_self', '');window.close(); });
	$("#disableNotification").click(disableNotification);
	$("#loadoptionspage").val(chrome.i18n.getMessage("options"));
	$(".i18_options").html(chrome.i18n.getMessage("options"));
	$("#closepage").val(chrome.i18n.getMessage("close"));
	$("#disableNotification").val(chrome.i18n.getMessage("dontshowpage"));
});
function disableNotification() {
	if (confirm(chrome.i18n.getMessage("updatedisable"))) {
		localStorage['updatenotify'] = 'false';
		$('#message').html('Update notifications disabled').stop().fadeIn("slow").delay(2000).fadeOut("slow");
	}
}