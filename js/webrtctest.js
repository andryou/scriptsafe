'use strict';
var rtcstatus = null;
var rtctest = self.RTCPeerConnection || self.webkitRTCPeerConnection;
try {
	if (rtctest) rtcstatus = new rtctest(null);
} catch (exception) {
	// do nothing
}
if (rtcstatus !== null) {
	rtcstatus.close();
}
parent.testWebRTC(rtcstatus);