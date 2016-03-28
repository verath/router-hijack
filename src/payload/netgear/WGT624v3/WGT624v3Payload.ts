import {Promise} from "es6-promise";
import Payload from "../../Payload";
import FingerprintResult from "../../../fingerprint/FingerprintResult";

class WGT624v3Payload implements Payload {

    isTarget(fingerprint:FingerprintResult):boolean {
        return (
            fingerprint.vendor === 'NETGEAR' &&
            fingerprint.hwVersion === 'WGT624v3'
        );
    }

    run(ip:string):Promise<any> {
        return Promise.resolve().then(() => {
            console.log("WGT624v3Payload");
            return true;
        });
    }
}

export default WGT624v3Payload;
