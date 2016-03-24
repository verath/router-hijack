import FingerprinterGroup from "../FingerprinterGroup";

class RouterFingerprinterGroup extends FingerprinterGroup {
    constructor() {
        super([
            new NetgearFingerprinter()
        ]);
    }
}

export default RouterFingerprinterGroup;