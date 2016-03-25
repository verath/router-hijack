import {Promise} from 'es6-promise';

import BaseFingerprinter from "../BaseFingerprinter";

class WNDR3700Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR', 'WNDR3700');
    }

    protected testIp(ip):Promise<boolean> {
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
}

export default WNDR3700Fingerprinter;
