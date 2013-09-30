document.addEventListener('DOMContentLoaded', function () {
	window.setTimeout(function() { window.close(); }, 5000);
	$("#disableNotification").click(disableNotification);
	$("#disableNotification2").click(disableNotification2);
});
function disableNotification() {
	localStorage['syncnotify'] = 'false';
	window.close();	
}
function disableNotification2() {
	localStorage['syncfromnotify'] = 'false';
	window.close();	
}