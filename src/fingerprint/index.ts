import {Promise} from 'es6-promise';

import FingerprintResult from "./FingerprintResult";
import FullFingerprinter from "./FullFingerprinter";

function testIp(ip):Promise<String> {
    return new Promise((resolve) => {
        let languageSrc = `http://${ip}/languages-en.js`;
        let frame = document.createElement('iframe');
        frame.style.display = 'none';

        let done = (success:boolean) => {
            languageScript.remove();
            frame.remove();
            resolve(success ? ip : null);
        };

        let languageScript = document.createElement('script');
        languageScript.src = languageSrc;
        languageScript.addEventListener('load', () => {
            let isMatch = (frame.contentWindow['know_href'] === "http://kbserver.netgear.com/wndr3700.asp");
            done(isMatch);
        });
        languageScript.addEventListener('error', () => done(false));

        document.body.appendChild(frame);
        frame.contentWindow.document.body.appendChild(languageScript);
    });
}

function ipToFingerprintResult(ip):FingerprintResult {
    // We only match one router atm
    return {
        ip: ip,
        vendor: 'NETGEAR',
        hwVersion: 'WNDR3700',
        fwVersion: '1.0.7.98'
    }
}

/**
 * Takes an array of ips and attempts to find out what (if any)
 * router is running at each ip.
 *
 * @param ips
 * @returns {Promise<FingerprintResult[]>}
 */
export default function doFingerprint(ips:String[]):Promise<FingerprintResult[]> {
    let testPromises = ips.map(testIp);
    return Promise.all(testPromises).then((ips) => {
        return ips.filter((ip) => ip != null).map(ipToFingerprintResult)
    });

}
