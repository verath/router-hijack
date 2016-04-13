import {Promise} from "es6-promise";
import BaseFingerprinter from "../../BaseFingerprinter";
import FingerprintUtil from "../../FingerprinterUtil";
import IPAddress from "../../../shared/IPAddress";
import PromiseUtil from "../../../shared/PromiseUtil";

class WNDR3700Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR', 'WNDR3700');
    }

    private static testLanguageScript(ip:IPAddress) {
        return FingerprintUtil.tryRunScript(`http://${ip}/languages-en.js`, (ctx:Window) => {
            return ctx['know_href'] === "http://kbserver.netgear.com/wndr3700.asp";
        });
    }

    protected testIp(ip:IPAddress):Promise<boolean> {
        return PromiseUtil.sequentially([
            () => WNDR3700Fingerprinter.testLanguageScript(ip)
        ]).then((results:boolean[]) => results.every(r => r))
    }
}

export default WNDR3700Fingerprinter;
