import FingerprinterGroup from "../FingerprinterGroup";
import WNDR3700Fingerprinter from "./WNDR3700/WNDR3700Fingerprinter";
import WGT624Fingerprinter from "./WGT624/WGT624Fingerprinter";

class NetgearFingerprinterGroup extends FingerprinterGroup {
    constructor() {
        super([
            new WNDR3700Fingerprinter(),
            new WGT624Fingerprinter()
        ]);
    }
}

export default NetgearFingerprinterGroup;
