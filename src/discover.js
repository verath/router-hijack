function testIp(ip) {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://${ip}/`, true);
        xhr.timeout = 1000;
        xhr.onload = () => resolve(ip);
        // We assume onerror is called only because the request
        // was denied for cross domain reasons. If that holds,
        // we also know that if we get an error instead of a
        // timeout, there is likely a web server at the ip.
        xhr.onerror = () => resolve(ip);
        xhr.ontimeout = () => resolve(null);
        xhr.send(null);
    });
}

/**
 * Attempts to discover interesting ip addresses of possible routers
 * on the private network.
 *
 * @returns {Promise.<Array>} Promise for an array of interesting ip addresses
 */
export default function discover() {
    let ipsToTest = [];
    for (let i = 0; i < 255; i++) {
        ipsToTest.push(`192.168.1.${i}`);
    }

    let testPromises = ipsToTest.map(testIp);
    return Promise.all(testPromises).then((ips) => {
        return ips.filter((ip) => ip != null);
    });
}
