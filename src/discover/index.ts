import {Promise} from "es6-promise";

function findLocalIPs():string[] {
    return [];
}

function testIp(ip):Promise<string> {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://${ip}/`, true);
        xhr.timeout = 2000;
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
 */
export default function doDiscover():Promise<string[]> {
    let ipsToTest = [];

    // Assume subnet mask is 255.255.255.0 and that router is in
    // bottom or top 5 ips of subnet
    let routerIpSuffixes = [
        '.0', '.1', '.2', '.3', '.4',
        '.250', '.251', '.252', '.253', '.254'
    ];

    let localIps = findLocalIPs();
    if(localIps.length === 0) {
        // If we can not determine local ip, guess some common ones
        localIps.push('192.168.0.x');
        localIps.push('192.168.1.x');
    }

    for(let ip of localIps) {
        let ipParts = ip.split('.');
        let localSubnet = [ipParts[0], ipParts[1], ipParts[2]].join('.');
        routerIpSuffixes.forEach((suffix) => {
            ipsToTest.push(localSubnet + suffix);
        });
    }

    console.log('discover', 'ipsToTest', ipsToTest.join(', '));

    let testPromises = ipsToTest.map(testIp);
    return Promise.all(testPromises).then((ips) => {
        return ips.filter((ip) => ip != null);
    });
}
