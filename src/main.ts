import {Promise} from "es6-promise";
import doDiscover from "./discover";
import doFingerprint from "./fingerprint/index";
import doPayload from "./payload";

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
        .then(doDiscover)
        .then(doFingerprint)
        .then(doPayload)
        .then(() => console.timeEnd("execTime"))
        .catch((err) => {
            console.error("Error caught in main!");
            console.error(err);
        })
})();
