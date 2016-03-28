import {Promise} from "es6-promise";
import FingerprintResult from "../../../fingerprint/FingerprintResult";
import BasePayload from "../../BasePayload";
import BasicAuthCredential from "../../BasicAuthCredential";

class WGT624v3Payload extends BasePayload {
    private auth:BasicAuthCredential;

    constructor(fingerprintResult:FingerprintResult) {
        super(fingerprintResult);
    }

    isTarget():boolean {
        return (
            this.fingerprintResult.vendor === 'NETGEAR' &&
            this.fingerprintResult.hwVersion === 'WGT624v3'
        );
    }

    runPayload():Promise<any> {
        return Promise.resolve()
            .then(() => this.guessAuth())
            .then(() => this.verifyFWVersion())
            .then(() => this.hijackDNS());
    }


    private guessAuth() {

    }

    private verifyFWVersion() {

    }

    private hijackDNS() {

    }
}

export default WGT624v3Payload;
