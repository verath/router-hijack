import {Promise} from 'es6-promise';

import FingerprintResult from "./FingerprintResult";
import FullFingerprinter from "./FullFingerprinter";
import Fingerprinter from "./Fingerprinter";

/**
 * Takes an array of ips and attempts to find out what (if any)
 * router is running at each ip.
 *
 * @param ips
 * @returns {Promise<FingerprintResult[]>}
 */
export default function doFingerprint(ips:String[]):Promise<FingerprintResult[]> {
    let fullFingerprinter:Fingerprinter = new FullFingerprinter();
    let initialValue:Promise<FingerprintResult[]>;
    initialValue = Promise.resolve([]);

    return ips.reduce((prevPromise, ip) => {
        return prevPromise.then((prevResults:FingerprintResult[]) => {
            return fullFingerprinter.fingerprint(ip).then(result => prevResults.concat(result));
        })
    }, initialValue);
}
