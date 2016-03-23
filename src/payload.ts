/**
 *
 * @param fingerprintResults {Array<FingerprintResult>}
 */
export default function payload(fingerprintResults) {
    fingerprintResults.forEach((fpRes) => {
        console.log(fpRes);
        document.writeln(`${fpRes.vendor} ${fpRes.hwVersion} (${fpRes.fwVersion}) found at ${fpRes.ip}`);
    });
}
