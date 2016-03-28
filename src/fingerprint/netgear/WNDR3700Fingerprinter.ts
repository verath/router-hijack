import {Promise} from "es6-promise";
import BaseFingerprinter from "../BaseFingerprinter";
import FingerprintUtil from "../FingerprinterUtil";

class WNDR3700Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR', 'WNDR3700');
    }

    protected testIp(ip):Promise<boolean> {
        let testLanguageScript = FingerprintUtil.tryRunScript(`http://${ip}/languages-en.js`, (ctx:Window) => {
            return ctx['know_href'] === "http://kbserver.netgear.com/wndr3700.asp";
        });

        return Promise.all([
            testLanguageScript
        ]).then((results:boolean[]) => results.every(r => r))
    }
}

export default WNDR3700Fingerprinter;
