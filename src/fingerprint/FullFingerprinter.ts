import FingerprinterGroup from "./FingerprinterGroup";
import NetgearFingerprinter from "./netgear/NetgearFingerprinter";

class FullFingerprinter extends FingerprinterGroup {
    constructor() {
        super([
            new NetgearFingerprinter()
        ]);
    }
}

export default FullFingerprinter;
