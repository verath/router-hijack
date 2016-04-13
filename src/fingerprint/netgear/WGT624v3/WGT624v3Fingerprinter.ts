import {Promise} from "es6-promise";
import FingerprintUtil from "../../FingerprinterUtil";
import BaseFingerprinter from "../../BaseFingerprinter";
import IPAddress from "../../../shared/IPAddress";
import PromiseUtil from "../../../shared/PromiseUtil";

class WGT624v3Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR', 'WGT624v3');
    }

    private static testImageFiles(ip:IPAddress):Promise<boolean> {
        let imageFiles = [
            "108g_logo.jpg",
            "BSW_network.gif",
            "liteblue.gif"
        ].map(src => `http://${ip}/${src}`);

        return FingerprintUtil.tryLoadAllImages(imageFiles);
    }

    private static testMsgScript(ip:IPAddress):Promise<boolean> {
        return FingerprintUtil.tryRunScript(`http://${ip}/msg.js`, (ctx:Window) => {
            return ctx['msg_less'] === "%s must be less than %s";
        });
    }

    protected testIp(ip:IPAddress):Promise<boolean> {
        return PromiseUtil.sequentially([
            () => WGT624v3Fingerprinter.testImageFiles(ip),
            () => WGT624v3Fingerprinter.testMsgScript(ip)
        ]).then((results:boolean[]) => results.every(r => r))
    }
}

export default WGT624v3Fingerprinter;
