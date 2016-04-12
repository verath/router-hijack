import {Promise} from "es6-promise";

/**
 * Class for finding ips of the user. This is achieved by using
 * STUN requests sent via WebRTC.
 * See https://github.com/diafygi/webrtc-ips
 */
class WebRTCIPFinder {
    private RTCPeerConnection;
    private rtcConfig;

    constructor() {
        this.RTCPeerConnection = window['RTCPeerConnection']
            || window['mozRTCPeerConnection']
            || window['webkitRTCPeerConnection'];

        this.rtcConfig = {
            iceServers: [{urls: "stun:stun.services.mozilla.com"}]
        };
    }

    public findUserIps(timeout:number = 1000):Promise<string[]> {
        if (!this.RTCPeerConnection) {
            return Promise.reject('RTCPeerConnection not supported.');
        }

        return new Promise((resolve, reject) => {
            let timeoutId;
            let ips = [];
            let peerConnection = new this.RTCPeerConnection(this.rtcConfig);
            let onIceCandidate = (evt) => {
                if (evt.candidate) {
                    let iceCandidate = evt.candidate;
                    let ip = WebRTCIPFinder.parseIpFromIceCandidate(iceCandidate);
                    if (ip != null && ips.indexOf(ip) === -1) {
                        ips.push(ip);
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
                    resolve(ips);
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

    private static parseIpFromIceCandidate(iceCandidate):string {
        if (iceCandidate.ip) {
            return iceCandidate.ip;
        } else {
            // See https://tools.ietf.org/html/rfc5245 - 15.1. "candidate" Attribute
            let candidateAttribute = iceCandidate.candidate;
            let ipRegExp = /^candidate:[0-9A-z+/]+ \d+ \w+ \d+ (\S+)/i;
            let res = ipRegExp.exec(candidateAttribute);
            if (res && res.length >= 2) {
                return res[1];
            }
        }
        return null;
    }
}

export default WebRTCIPFinder;
