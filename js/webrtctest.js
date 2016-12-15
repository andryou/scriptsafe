// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.
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
parent.testWebRTC((rtcstatus !== null));