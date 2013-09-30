// (c) Andrew Y. <andryou@gmail.com>
// Supporting functions by AdThwart - T. Joseph
var syncstatus;
document.addEventListener('DOMContentLoaded', function () {
	loadOptions();
	$(".save").click(saveOptions);
	$("#domainsort").click(domainsort);
	$("#whitebind").click(whitelistlisten);
	$("#blackbind").click(blacklistlisten);
	$("#whiteclear").click(whiteclear);
	$("#blackclear").click(blackclear);
	$("#importwhite").click(importwhite);
	$("#importblack").click(importblack);
	$("#hideimport").click(hidebulk);
	$("#importsettings").click(settingsImport);
	$("#settingsall").click(settingsall);
	$(".savechange").change(saveOptions);
	$(".close").click(closeOptions);
	$("#syncimport").click(forceSyncImport);
	$("#syncexport").click(forceSyncExport);
	$("#restoretool").click(restoretool);
	syncstatus = localStorage['syncenable'];
});
function restoretool() {
	status = bkg.listsSync(3);
	if (status == 'false') {
		alert('ScriptSafe could not find a backup of your previous whitelist/blacklist.');
	}
}
function forceSyncExport() {
	if(confirm('Do you want to sync your current settings to your Google Account?\r\nNote: please do not press this frequently; there is a limit of 10 per minute and 1,000 per hour.')) {
		status = bkg.freshSync(0, true);
		if (status == 'true') {
			notification('Settings successfully synced to your Google Account');
		}
	}
}
function forceSyncImport() {
	if(confirm('Do you want to import the synced settings from your Google Account to this device?')) {
		status = bkg.importSyncHandle(1);
		if (status == 'true') {
			notification('Settings successfully synced from your Google Account to this device');
			location.reload();
		}
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
	saveOptions();listUpdate();
}
var version = (function () {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('../manifest.json'), false);
	xhr.send(null);
	return JSON.parse(xhr.responseText).version;
}());

var bkg = chrome.extension.getBackgroundPage();

var settingnames = [];

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
			alert('You have enabled auto-syncing. In order to prevent erasing your previously synced data (if any), please click on "Sync Settings FROM Google Account".');
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
	if (localStorage['annoyances'] == 'true') $("#annoyancesmoderow").show();
	else $("#annoyancesmoderow").hide();
	if (localStorage['useragentspoof'] != 'off') $("#useragentspoof_os").show();
	else $("#useragentspoof_os").hide();
	loadCheckbox("enable");
	loadCheckbox("syncenable");
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
	loadCheckbox("xml");
	loadCheckbox("annoyances");
	loadElement("annoyancesmode");
	loadCheckbox("antisocial");
	loadCheckbox("webbugs");
	loadCheckbox("preservesamedomain");
	loadCheckbox("classicoptions");
	loadCheckbox("referrer");
	loadCheckbox("rating");
	loadCheckbox("domainsort");
	loadElement("linktarget");
	loadCheckbox("cookies");
	loadElement("useragentspoof");
	loadElement("useragentspoof_os");
	if (localStorage['referrerspoof'] != 'same' && localStorage['referrerspoof'] != 'domain' && localStorage['referrerspoof'] != 'off') {
		$("#referrerspoof").val('custom');
		$("#customreferrer").show();
		$("#userref").val(localStorage['referrerspoof']);
	} else loadElement("referrerspoof");
	listUpdate();
}
function saveOptions() {
	saveCheckbox("enable");
	saveCheckbox("syncenable");
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
	saveCheckbox("xml");
	saveCheckbox("annoyances");
	saveElement("annoyancesmode");
	saveCheckbox("antisocial");
	saveCheckbox("webbugs");
	saveCheckbox("preservesamedomain");
	saveCheckbox("classicoptions");
	saveCheckbox("referrer");
	saveCheckbox("rating");
	saveCheckbox("cookies");
	saveElement("useragentspoof");
	saveElement("useragentspoof_os");
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
	if (localStorage['annoyances'] == 'true') $("#annoyancesmoderow").show();
	else $("#annoyancesmoderow").hide();
	if (localStorage['useragentspoof'] != 'off') $("#useragentspoof_os").show();
	else $("#useragentspoof_os").hide();
	updateExport();
	bkg.refreshRequestTypes();
	syncstatus = bkg.freshSync(1);
	if (syncstatus) {
		notification('Settings saved and syncing in 30 seconds');
	} else {
		notification('Settings saved');
	}
}
function selectAll(id) {
	$("#"+id).select();
}
function settingsImport() {
	var error = "";
	var settings = $("#settingsimport").val().split("\n");
	if ($.trim($("#settingsimport").val()) == "") {
		notification('Paste in your exported settings and try again ;)');
		return false;
	}
	if (settings.length > 0) {
		$.each(settings, function(i, v) {
			if ($.trim(v) != "") {
				settingentry = $.trim(v).split("|");
				if (settingnames.indexOf($.trim(settingentry[0])) != -1 && $.trim(settingentry[1]) != '') {
					if ($.trim(settingentry[0]) == 'whiteList' || $.trim(settingentry[0]) == 'blackList') {
						listarray = $.trim(settingentry[1]).replace(/(\[|\]|")/g,"").split(",");
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
	if (!error) {
		syncstatus = bkg.freshSync(0);
		if (syncstatus) {
			notification('Settings imported successfully and syncing in 30 seconds');
		} else {
			notification('Settings imported successfully');
		}
		$("#settingsimport").val("");
	} else {
		bkg.freshSync(0);
		notification('Error importing the following settings (empty value and/or invalid setting name): '+error.slice(0, -2));
	}
}
function updateExport() {
	$("#settingsexport").val("");
	for (i in localStorage) {
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
// <!-- modified from KB SSL Enforcer: https://code.google.com/p/kbsslenforcer/
function addList(type) {
	var domain = $('#url').val().toLowerCase().replace("http://", "").replace("https://", "");
	var domainValidator = new RegExp('^(\\*\\.)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.?)+[a-z0-9-]+$');
	if (!(domainValidator.test(domain.toLowerCase()))) {
		notification('Invalid domain');
	} else {
		if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && bkg.domainCheck(domain.toLowerCase(), 1) != '0')) && bkg.baddies(bkg.getDomain(domain.toLowerCase()), localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && bkg.baddies(bkg.getDomain(domain.toLowerCase()), localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
			notification('Domain cannot be added as it is a provider of unwanted content (see "Block Unwanted Content" and/or "Antisocial Mode")');
		} else {
			responseflag = bkg.domainHandler(domain, type);
			if (responseflag) {
				$('#url').val('');
				syncstatus = bkg.freshSync(2);
				if (syncstatus) {
					notification(['Whitelisted','Blacklisted'][type]+' '+domain+' and syncing in 30 seconds.');
				} else {
					notification(['Whitelisted','Blacklisted'][type]+' '+domain+'.');
				}
				listUpdate();
			} else {
				notification(domain+' not added as it already exists in the list or the entire domain has been '+['whitelisted','blacklisted'][type]);
			}
			$('#url').focus();
		}
	}
	return false;
}
function domainRemover(domain) {
	if(confirm("Are you sure you want to remove "+domain+" from this list?")) {
		bkg.domainHandler(domain,2);
		listUpdate();
		syncstatus = bkg.freshSync(2);
		if (syncstatus) {
			notification('Successfully removed: '+domain+' and syncing in 30 seconds.');
		} else {
			notification('Successfully removed: '+domain);
		}
	}
	return false;
}
function topDomainAdd(domain, mode) {
	if (mode == '0') lingo = 'trust';
	else if (mode == '1') lingo = 'distrust';
	if (domain && !domain.match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g) && domain[0] != '*' && domain[1] != '.' && confirm("Are you sure you want to "+lingo+" "+bkg.getDomain(domain)+"?\r\n\r\Click OK will mean all subdomains on "+bkg.getDomain(domain)+" will be "+lingo+"ed, such as _."+bkg.getDomain(domain)+" and even _._._."+bkg.getDomain(domain)+".")) {
		result = bkg.topHandler(domain, mode);
		listUpdate();
		bkg.freshSync(2);
		notification('Successfully '+lingo+'ed: '+domain);
	}
}
function hidebulk() {
	$("#bulk").slideUp("fast");
}
function bulk(type) {
	var error = false;
	hidebulk();
	if (!$("#bulk").is(":visible")) $("#bulk").slideDown("fast");
	$("#bulk textarea").focus();
	if (type == '0') {
		$("#bulk strong").html("Whitelist Bulk Import");
		$("#bulkbtn").val("Import to Whitelist").click(importbulkwhite);
	} else if (type == '1') {
		$("#bulk strong").html("Blacklist Bulk Import");
		$("#bulkbtn").val("Import to Blacklist").click(importbulkblack);
	}
}
function importbulk(type) {
	var error = '';
	var domains = $("#bulk textarea").val().split("\n");
	var domainValidator = new RegExp('^(\\*\\.)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\\.?)+[a-z0-9-]+$');
	if ($.trim($("#bulk textarea").val()) == "") {
		hidebulk();
		return false;
	}
	if (domains.length > 0) {
		$.each(domains, function(i, v) {
			if ($.trim(v) != "") {
				if ((localStorage['annoyances'] == 'true' && (localStorage['annoyancesmode'] == 'strict' || (localStorage['annoyancesmode'] == 'relaxed' && bkg.domainCheck($.trim(v).toLowerCase().replace("http://", "").replace("https://", ""), 1) != '0')) && bkg.baddies(bkg.getDomain($.trim(v).toLowerCase().replace("http://", "").replace("https://", "")), localStorage['annoyancesmode'], localStorage['antisocial']) == 1) || (localStorage['antisocial'] == 'true' && bkg.baddies(bkg.getDomain($.trim(v).toLowerCase().replace("http://", "").replace("https://", "")), localStorage['annoyancesmode'], localStorage['antisocial']) == '2')) {
					error += '<li>'+$.trim(v).toLowerCase().replace("http://", "").replace("https://", "")+' <b>(provider of unwanted content (see "Block Unwanted Content" and/or "Antisocial Mode")</b></li>';
				} else {
					if (domainValidator.test($.trim(v).toLowerCase().replace("http://", "").replace("https://", ""))) {
						bkg.domainHandler($.trim(v).toLowerCase().replace("http://", "").replace("https://", ""), type);
					} else {
						error += '<li>'+$.trim(v).toLowerCase().replace("http://", "").replace("https://", "")+'</li>';
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
		$('#importerror').html('<br /><strong>Some Domains Not Imported</strong><br />The following domains were not imported as they are invalid (the others were successfully imported): <ul>'+error+'</ul>').stop().fadeIn("slow");
	}
}
function listUpdate() {
	var whiteList = JSON.parse(localStorage['whiteList']);
	var blackList = JSON.parse(localStorage['blackList']);
	var whitelistCompiled = '';
	if (whiteList.length==0) whitelistCompiled = '[none]';
	else {
		if (localStorage['domainsort'] == 'true') whiteList = bkg.domainSort(whiteList);
		else whiteList.sort();
		for (i in whiteList) {
			if ((whiteList[i][0] == '*' && whiteList[i][1] == '.') || whiteList[i].match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'>X</a></div>'+whiteList[i]+'</div>';
			else whitelistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+whiteList[i]+'\' rel="0">Trust Domain</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+whiteList[i]+'\'>X</a></div>'+whiteList[i]+'</div>';
		}
	}
	var blacklistCompiled = '';
	if (blackList.length==0) blacklistCompiled = '[none]';
	else {
		if (localStorage['domainsort'] == 'true') blackList = bkg.domainSort(blackList);
		else blackList.sort();
		for (i in blackList) {
			if ((blackList[i][0] == '*' && blackList[i][1] == '.') || blackList[i].match(/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/g)) blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'>X</a></div>'+blackList[i]+'</div>';
			else blacklistCompiled += '<div class="listentry"><div class="entryoptions"><a href="javascript:;" style="color:green;" class="topDomainAdd" title=\''+blackList[i]+'\' rel="1">Distrust Domain</a> | <a href="javascript:;" style="color:#f00;" class="domainRemover" rel=\''+blackList[i]+'\'>X</a></div>'+blackList[i]+'</div>';
		}
	}
	$('#whitelist').html(whitelistCompiled);
	$('#blacklist').html(blacklistCompiled);
	$(".domainRemover, .topDomainAdd").unbind('click');
	$(".domainRemover").click(function() { domainRemover($(this).attr('rel'));});
	$(".topDomainAdd").click(function() { topDomainAdd($(this).attr('title'), $(this).attr('rel'));});
	updateExport();
}
function listclear(type) {
	if (confirm(['Clear whitelist?','Clear blacklist?'][type])) {
		localStorage[['whiteList','blackList'][type]] = JSON.stringify([]);
		listUpdate();
		syncstatus = bkg.freshSync(2);
		if (syncstatus) {
			notification('Settings saved and syncing in 30 seconds');
		} else {
			notification('Settings saved');
		}
	}
	return false;
}
// from KB SSL Enforcer: https://code.google.com/p/kbsslenforcer/ -->