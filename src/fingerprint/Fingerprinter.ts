import {Promise} from "es6-promise";
import FingerprintResult from "./FingerprintResult";
import IPAddress from "../shared/IPAddress";

interface Fingerprinter {
    fingerprint(ip:IPAddress):Promise<FingerprintResult[]>;
}

export default Fingerprinter;
