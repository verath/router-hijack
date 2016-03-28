import {Promise} from "es6-promise";

interface Payload {

    /**
     * isTarget should return a boolean indicating if the payload should
     * be run for the identified device or not. This check should likely
     * be quite permissive, as the fingerprinting is unlikely to exactly
     * identify the device. Instead, it might be better to do a decision
     * on (model, hwVersion) here and then do additional checking when
     * the payload is run.
     *
     */
    isTarget():boolean

    /**
     * Runs the payload against the target. This method should only every
     * be called if isTarget returns true. The returned promise is resolved
     * on success.
     */
    run():Promise<boolean>
}

export default Payload;
