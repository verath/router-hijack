function discover(ip) {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://${ip}/`, true);
        xhr.timeout = 1000;
        xhr.onload = () => resolve(true);
        // We assume onerror is called only because the request
        // was denied for cross domain reasons. If that holds,
        // we also know that if we get an error instead of a
        // timeout, there is likely a web server at the ip.
        xhr.onerror = () => resolve(true);
        xhr.ontimeout = () => resolve(false);
        xhr.send(null);
    });

}

function fingerprint(ip) {
    return new Promise((resolve) => {
        let languageSrc = `http://${ip}/languages-en.js`;
        let frame = document.createElement('iframe');
        frame.style.display = 'none';

        let done = (success) => {
            languageScript.remove();
            frame.remove();
            resolve(success);
        };

        let languageScript = document.createElement('script');
        languageScript.src = languageSrc;
        languageScript.addEventListener('load', () => {
            let isMatch = (frame.contentWindow['know_href'] === "http://kbserver.netgear.com/wndr3700.asp");
            done(isMatch);
        });
        languageScript.addEventListener('error', () => done(false));

        document.body.appendChild(frame);
        frame.contentWindow.document.body.appendChild(languageScript);
    });
}

// TODO: usch
function promiseFilter(filterFunc, arr) {
    let promises = arr.map(filterFunc);
    return Promise.all(promises).then((filterRes) => {
        let result = [];
        filterRes.forEach((passed, idx) => {
            if (passed) {
                result.push(arr[idx]);
            }
        });
        return result;
    });
}

(function main() {

    window.addEventListener('load', () => {
        console.time('execTime');

        let addresses = [];
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 255; j++) {
                addresses.push(`192.168.${i}.${j}`);
            }
        }

        promiseFilter(discover, addresses)
            .then((addresses) => promiseFilter(fingerprint, addresses))
            .then((addresses) => {
                addresses.forEach((addr) => {
                    console.log("Found at:", addr);
                });
                console.timeEnd('execTime');
            })
            .catch((err) => {
                console.error(err);
            })
    });

    // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
    const PRIVATE_NETWORKS = [
        "10.0.0.0-10.255.255.255",
        "172.16.0.0-172.31.255.255",
        "192.168.0.0-192.168.255.255"
    ];
})();



