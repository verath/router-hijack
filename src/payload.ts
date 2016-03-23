import {FingerprintResult} from "./fingerprint/FingerprintResult";

export default function payload(fingerprintResults:FingerprintResult[]) {
    fingerprintResults.forEach((fpRes) => {
        console.log(fpRes);
        document.writeln(`${fpRes.vendor} ${fpRes.hwVersion} (${fpRes.fwVersion}) found at ${fpRes.ip}`);
    });
}
