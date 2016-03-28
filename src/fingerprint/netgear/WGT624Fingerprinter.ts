import {Promise} from "es6-promise";
import FingerprintUtil from "../FingerprinterUtil";
import BaseFingerprinter from "../BaseFingerprinter";

class WGT624Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR', 'WGT624');
    }

    protected testIp(ip):Promise<boolean> {
        let imageFiles = [
            "108g_logo.jpg",
            "BSW_network.gif",
            "liteblue.gif"
        ].map(src => `http://${ip}/${src}`);
        let testImageFiles = FingerprintUtil.tryLoadAllImages(imageFiles);

        let testMsgScript = FingerprintUtil.tryRunScript(`http://${ip}/msg.js`, (ctx:Window) => {
            return ctx['msg_less'] === "%s must be less than %s";
        });

        return Promise.all([
            testImageFiles,
            testMsgScript
        ]).then((results:boolean[]) => results.every(r => r))
    }
}

export default WGT624Fingerprinter;
