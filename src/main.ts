import {Promise} from "es6-promise";
import IPAddress from "./shared/IPAddress";
import FingerprintResult from "./fingerprint/FingerprintResult";
import doDiscoverDevices from "./discover_devices/index";
import doFingerprint from "./fingerprint/index";
import doPayload from "./payload/index";
import doLocalIp from "./local_ip/index";

function waitForDOMContentLoaded():Promise<any> {
    if (document.readyState === 'complete') {
        return Promise.resolve();
    } else {
        return new Promise((resolve) => {
            document.addEventListener("DOMContentLoaded", resolve)
        });
    }
}

function printLocalIp(ips:IPAddress[]):IPAddress[] {
    console.group('Local Ip Results');
    ips.forEach((ip) => {
        console.info(ip.toString())
    });
    console.groupEnd();
    return ips;
}

function printDiscoveredDevices(ips:IPAddress[]):IPAddress[] {
    console.group('Discover Results');
    ips.forEach((ip) => {
        console.info(ip.toString())
    });
    console.groupEnd();
    return ips;
}

function printFingerprintedDevices(fingerprints:FingerprintResult[]):FingerprintResult[] {
    console.group('Fingerprint Results');
    fingerprints.forEach((fp) => {
        console.info(`${fp.ip} -> ${fp.vendor}:${fp.hwVersion}:${fp.fwVersion}`)
    });
    console.groupEnd();
    return fingerprints;
}

(function main() {
    waitForDOMContentLoaded()
        .then(() => console.time("execTime"))
        .then(doLocalIp)
        .then(printLocalIp)
        .then(doDiscoverDevices)
        .then(printDiscoveredDevices)
        .then(doFingerprint)
        .then(printFingerprintedDevices)
        .then(doPayload)
        .then(() => console.timeEnd("execTime"))
        .catch((err) => {
            console.error("Error caught in main!");
            console.error(err);
        })
})();
