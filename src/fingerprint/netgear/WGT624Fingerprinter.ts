import {Promise} from 'es6-promise';

import FingerprintUtil from "../FingerprintUtil";
import BaseFingerprinter from "../BaseFingerprinter";

class WGT624Fingerprinter extends BaseFingerprinter {

    constructor() {
        super('NETGEAR','WGT624');
    }

    protected testIp(ip):Promise<boolean> {
        let imageFiles = [
            "108g_logo.jpg",
            "BSW_network.gif",
            "darkblue.gif",
            "liteblue.gif",
            "menublue.gif",
            "redbull.gif",
            "spacer.gif",
            "upload.gif"
        ].map(src => `http://${ip}/${src}`);

        return Promise.all([
            FingerprintUtil.tryLoadAllImages(imageFiles)
        ]).then((results:boolean[]) => results.every(r => r))
    }
}

export default WGT624Fingerprinter;
