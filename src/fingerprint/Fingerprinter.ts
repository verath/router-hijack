import {Promise} from "es6-promise";
import FingerprintResult from "./FingerprintResult";
import IPAddress from "../shared/IPAddress";

interface Fingerprinter {
    /**
     * Takes an ip and returns an array of FingerprintResult, each
     * representing a matched device.
     *
     * @param ip The ip to test.
     * @return A promise, resolved with an array of matching
     * FingerprintResults on success.§
     */
    fingerprint(ip:IPAddress):Promise<FingerprintResult[]>;
}

export default Fingerprinter;
