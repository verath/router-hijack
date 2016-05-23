import FingerprinterGroup from "./FingerprinterGroup";
import NetgearFingerprinter from "./netgear/NetgearFingerprinter";

/**
 * The top fingerprinter that uses all other fingerprinters.
 */
class FullFingerprinter extends FingerprinterGroup {
    constructor() {
        super([
            new NetgearFingerprinter()
        ]);
    }
}

export default FullFingerprinter;
