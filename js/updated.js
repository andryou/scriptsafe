document.addEventListener('DOMContentLoaded', function () {
	var version = (function () {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
		xhr.send(null);
		return JSON.parse(xhr.responseText).version;
	}());
	$('#versionno').html(version);
	$("#loadoptionspage").click(function() { location.href='options.html'; });
	$("#closepage").click(function() { window.open('', '_self', '');window.close(); });
	$("#disableNotification").click(disableNotification);
});
function disableNotification() {
	if (confirm('Are you sure you want to disable any future update notifications like this one from appearing?\r\nYou can always re-allow update notifications by going to the ScriptSafe Options page and ticking the box beside "Show Update Popup".')) {
		localStorage['updatenotify'] = 'false';
		$('#message').html('Update notifications disabled').stop().fadeIn("slow").delay(2000).fadeOut("slow");
	}
}