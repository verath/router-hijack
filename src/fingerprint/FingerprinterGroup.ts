import {Promise} from "es6-promise";
import Fingerprinter from "./Fingerprinter";
import FingerprintResult from "./FingerprintResult";
import IPAddress from "../shared/IPAddress";
import PromiseUtil from "../shared/PromiseUtil";

abstract class FingerprinterGroup implements Fingerprinter {
    private fingerprinters:Fingerprinter[] = [];

    constructor(fingerprinters:Fingerprinter[]) {
        this.fingerprinters = fingerprinters;
    }

    /**
     * Takes an ip and runs each fingerprinter in the group for that ip.
     *
     * @param ip
     * @returns {Promise<FingerprintResult[]>}
     */
    fingerprint(ip:IPAddress):Promise<FingerprintResult[]> {
        let promiseFuncs = this.fingerprinters.map((fingerprinter:Fingerprinter) => {
            return () => fingerprinter.fingerprint(ip);
        });

        return PromiseUtil.sequentially(promiseFuncs).then((result:FingerprintResult[][]) => {
            // Flatten FingerprintResult[][] -> FingerprintResult[]
            return result.reduce((prev, curr) => prev.concat(curr), []);
        });
    }
}

export default FingerprinterGroup;
