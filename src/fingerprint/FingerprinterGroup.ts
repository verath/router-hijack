import {Promise} from 'es6-promise';

import Fingerprinter from "./Fingerprinter";
import FingerprintResult from "./FingerprintResult";

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
    fingerprint(ip:String):Promise<FingerprintResult[]> {
        let initialValue:Promise<FingerprintResult[]>;
        initialValue = Promise.resolve([]);

        // Run each fingerprinter sequentially, collect the results of all
        // fingerprinters and return a flattened list of results.
        // TODO: Rewrite in a less complicated way
        return this.fingerprinters.reduce((prevPromise, fingerprinter) => {
            return prevPromise.then((prevResult:FingerprintResult[]) => {
                // Run the next fingerprinter, and append its result to
                // the result of the previous promise
                return fingerprinter.fingerprint(ip).then(result => prevResult.concat(result));
            });
        }, initialValue);
    }
}

export default FingerprinterGroup;
