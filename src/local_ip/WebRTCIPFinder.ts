import {Promise} from "es6-promise";
import IPAddress from "../shared/IPAddress";

/**
 * Class for finding ips of the user. This is achieved by using
 * STUN requests sent via WebRTC.
 * See https://github.com/diafygi/webrtc-ips
 */
class WebRTCIPFinder {

    public static findUserIps(timeout:number = 1000):Promise<IPAddress[]> {
        let RTCPeerConnection = window['RTCPeerConnection']
            || window['mozRTCPeerConnection']
            || window['webkitRTCPeerConnection'];
        let rtcConfig = {
            iceServers: [{urls: "stun:stun.services.mozilla.com"}]
        };

        if (!RTCPeerConnection) {
            return Promise.reject('RTCPeerConnection not supported.');
        }

        return new Promise((resolve, reject) => {
            let timeoutId;
            let ipAddresses:IPAddress[] = [];
            let peerConnection = new RTCPeerConnection(rtcConfig);
            let onIceCandidate = (evt) => {
                if (evt.candidate) {
                    let iceCandidate = evt.candidate;
                    let ip = WebRTCIPFinder.parseIpFromIceCandidate(iceCandidate);
                    if (ip != null && ipAddresses.every(other => !ip.equals(other))) {
                        ipAddresses.push(ip);
                    }
                }
            };
            let done = (error?) => {
                clearTimeout(timeoutId);
                peerConnection.onicecandidate = null;
                peerConnection.close();
                peerConnection = null;
                if (error) {
                    reject(error);
                } else {
                    resolve(ipAddresses);
                }
            };

            peerConnection.onicecandidate = onIceCandidate;
            peerConnection.createDataChannel('');
            peerConnection.createOffer((sdp) => {
                peerConnection.setLocalDescription(sdp);
            }, (err) => done(err));
            timeoutId = setTimeout(done, timeout);
        });
    }

    private static parseIpFromIceCandidate(iceCandidate):IPAddress {
        if (iceCandidate.ip) {
            return iceCandidate.ip;
        } else {
            // See https://tools.ietf.org/html/rfc5245 - 15.1. "candidate" Attribute
            let candidateAttribute = iceCandidate.candidate;
            let ipRegExp = /^candidate:[0-9A-z+/]+ \d+ \w+ \d+ (\S+)/i;
            let res = ipRegExp.exec(candidateAttribute);
            if (res && res.length >= 2) {
                return IPAddress.fromString(res[1]);
            }
        }
        return null;
    }
}

export default WebRTCIPFinder;
