import {Promise} from 'es6-promise';

import discover from './discover';
import fingerprint from './fingerprint';
import payload from './payload';

function waitForDOMContentLoaded() : Promise<any> {
    if(document.readyState === 'complete') {
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
        .then(discover)
        .then(fingerprint)
        .then(payload)
        .then(() => console.timeEnd("execTime"))
        .catch((err) => {
            console.error("Error caught in main!");
            console.error(err);
        })
})();
