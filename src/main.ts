import {Promise} from "es6-promise";
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

(function main() {
    waitForDOMContentLoaded()
        .then(() => console.time("execTime"))
        .then(doLocalIp)
        .then(doDiscoverDevices)
        .then(doFingerprint)
        .then(doPayload)
        .then(() => console.timeEnd("execTime"))
        .catch((err) => {
            console.error("Error caught in main!");
            console.error(err);
        })
})();
