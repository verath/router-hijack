import FingerprinterGroup from "./FingerprinterGroup";
import NetgearFingerprinterGroup from "./netgear/NetgearFingerprinterGroup";

class FullFingerprinter extends FingerprinterGroup {
    constructor() {
        super([
            new NetgearFingerprinterGroup()
        ]);
    }
}

export default FullFingerprinter;
