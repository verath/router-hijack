import {Promise} from 'es6-promise';

import Fingerprinter from "../../Fingerprinter";
import FingerprintResult from "../../FingerprintResult";

class WNDR3700Fingerprinter implements Fingerprinter {
    fingerprint(ip:String):Promise<FingerprintResult> {
        return null;
    }
}

export default WNDR3700Fingerprinter;
