import {Promise} from "es6-promise";
import FingerprintResult from "../fingerprint/FingerprintResult";

interface Payload {

    /**
     * isTarget takes a FingerprintResult and should return a boolean
     * indicating if the payload should be run for the identified device
     * or not. This check should likely be quite permissive, as the
     * fingerprinting is unlikely to exactly identify the device. Instead,
     * it might be better to do a decision on (model, hwVersion) here and
     * then do additional checking when the payload is run.
     *
     * @param fingerprint
     */
    isTarget(fingerprint:FingerprintResult):boolean;

    /**
     * Runs the payload against the target ip. This method
     * should only every be called if isTarget returns true.
     *
     * @param ip
     */
    run(ip:string):Promise<any>;
}

export default Payload;
