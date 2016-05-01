import {Promise} from 'es6-promise';

import Payload from "./Payload";
import FingerprintResult from "../fingerprint/FingerprintResult";


abstract class BasePayload implements Payload {
    protected fingerprintResult:FingerprintResult;
    protected baseUrl:string;

    constructor(fingerprintResult:FingerprintResult) {
        this.fingerprintResult = fingerprintResult;
        this.baseUrl = `http://${fingerprintResult.ip}`;
    }

    run():Promise<boolean> {
        return this.runPayload()
            .catch((err) => {
                console.log("Payload failed for:", this.fingerprintResult);
                console.error(err);
                return false
            });
    }

    protected abstract runPayload():Promise<boolean>

    abstract isTarget():boolean

}

export default BasePayload;
