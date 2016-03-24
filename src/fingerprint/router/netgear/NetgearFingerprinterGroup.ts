import FingerprinterGroup from "../../FingerprinterGroup";
import WNDR3700Fingerprinter from "./WNDR3700Fingerprinter";

class NetgearFingerprinterGroup extends FingerprinterGroup {
    constructor() {
        super([
            new WNDR3700Fingerprinter()
        ]);
    }
}

export default NetgearFingerprinterGroup;
