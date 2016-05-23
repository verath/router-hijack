import {Promise} from "es6-promise";
import FingerprintResult from "./../fingerprint/FingerprintResult";
import WGT624v3Payload from "./netgear/WGT624v3/WGT624v3Payload";
import Payload from "./Payload";
import {PromiseFunction, default as PromiseUtil} from "../shared/PromiseUtil";

function runPayload(payload:Payload) {
    if (payload.isTarget()) {
        return payload.run();
    } else {
        return Promise.resolve(false)
    }
}

function createPayloads(fpRes:FingerprintResult):Payload[] {
    return [
        new WGT624v3Payload(fpRes)
    ];
}

/**
 * Attempts to run the payloads for each matching device.
 *
 * @param fingerprintResults
 * @return {Promise<boolean[]>}
 */
export default function doPayload(fingerprintResults:FingerprintResult[]) {
    let payloadFuncs:PromiseFunction<boolean>[] = [];

    fingerprintResults.forEach((fpRes:FingerprintResult) => {
        let payloads:Payload[] = createPayloads(fpRes);

        payloads.forEach((payload:Payload) => {
            payloadFuncs.push(() => runPayload(payload))
        });
    });

    return PromiseUtil.sequentially(payloadFuncs);
}
