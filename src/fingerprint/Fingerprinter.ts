import {Promise} from 'es6-promise';

import FingerprintResult from "./FingerprintResult";

interface Fingerprinter {
    fingerprint(ip:string):Promise<FingerprintResult[]>;
}

export default Fingerprinter;
