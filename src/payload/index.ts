import {Promise} from "es6-promise";
import FingerprintResult from "./../fingerprint/FingerprintResult";
import WGT624v3Payload from "./netgear/WGT624v3/WGT624v3Payload";

export default function doPayload(fingerprintResults:FingerprintResult[]) {


    let promises = fingerprintResults.map((fpRes:FingerprintResult) => {
        console.log(fpRes);
        document.writeln(`${fpRes.vendor} ${fpRes.hwVersion} (${fpRes.fwVersion}) found at ${fpRes.ip}`);
        document.writeln('<br>');

        let wgt624v3Payload = new WGT624v3Payload(fpRes);
        return wgt624v3Payload.run();
    });

    return Promise.all(promises);
}
