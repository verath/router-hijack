import {Promise} from 'es6-promise';

import Fingerprinter from "../Fingerprinter";
import FingerprintResult from "../FingerprintResult";

class WNDR3700Fingerprinter implements Fingerprinter {

    private testIp(ip):Promise<Boolean> {
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

    fingerprint(ip:String):Promise<FingerprintResult[]> {
        return this.testIp(ip).then(testPassed => {
            let results = [];
            if(testPassed) {
                results.push({
                    ip: ip,
                    vendor: 'NETGEAR',
                    hwVersion: 'WNDR3700'
                });
            }
            return results;
        });
    }
}

export default WNDR3700Fingerprinter;
