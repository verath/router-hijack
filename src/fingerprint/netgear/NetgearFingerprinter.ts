import FingerprinterGroup from "../FingerprinterGroup";
import WNDR3700Fingerprinter from "./WNDR3700/WNDR3700Fingerprinter";
import WGT624v3Fingerprinter from "./WGT624v3/WGT624v3Fingerprinter";

class NetgearFingerprinter extends FingerprinterGroup {
    constructor() {
        super([
            new WNDR3700Fingerprinter(),
            new WGT624v3Fingerprinter()
        ]);
    }
}

export default NetgearFingerprinter;
