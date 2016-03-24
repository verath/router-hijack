import FingerprinterGroup from "./FingerprinterGroup";
import RouterFingerprinterGroup from "./router/RouterFingerprinterGroup";

class FullFingerprinter extends FingerprinterGroup {
    constructor() {
        super([
            new RouterFingerprinterGroup()
        ]);
    }
}

export default FullFingerprinter;
