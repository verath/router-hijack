import {Promise} from 'es6-promise';

import Fingerprinter from "./Fingerprinter";
import FingerprintResult from "./FingerprintResult";

abstract class FingerprinterGroup implements Fingerprinter {
    private fingerprinters:Fingerprinter[] = [];

    constructor(fingerprinters:Fingerprinter[]) {
        this.fingerprinters = fingerprinters;
    }

    fingerprint(ip:String):Promise<FingerprintResult[]> {
        // Run each fingerprinter at the same time.
        // NOTE: Might not want to do this if the number
        // of fingerprinters is large
        let promises = this.fingerprinters.map(fingerprinter => fingerprinter.fingerprint(ip));

        return Promise.all(promises).then(results => {
            // results here is an array of results, one for each
            // fingerprinter => have to flatten it.
            results.reduce((a, b) => a.concat(b));
        });
    }
}

export default FingerprinterGroup;
