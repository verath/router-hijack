import {Promise} from "es6-promise";
import WebRTCIPFinder from "./WebRTCIPFinder";

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

function findFromLocalIps(localIps:string[]) {
    // Assume subnet mask is 255.255.255.0 and that router is in
    // bottom or top 5 ips of subnet
    let routerIpSuffixes = [
        '.0', '.1', '.2', '.3', '.4',
        '.250', '.251', '.252', '.253', '.254'
    ];

    let ipsToTest:string[] = [];
    for (let ip of localIps) {
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

function filterNonLocalIps(ips:string[]):string[] {
    return ips.filter((ip) => {
        // 10.0.0.0 - 10.255.255.255
        if (ip.indexOf('10.') === 0) {
            return true;
        }
        // 192.168.0.0 - 192.168.255.255
        if (ip.indexOf('192.168.') === 0) {
            return true;
        }
        // 172.16.0.0 - 172.31.255.255
        // TODO: Better way to do this?
        for (let i = 16; i <= 31; i++) {
            if (ip.indexOf(`172.${i}.`) === 0) {
                return true;
            }
        }
        return false;
    });
}

/**
 * Attempts to discover interesting ip addresses of possible routers
 * on the private network.
 */
export default function doDiscover():Promise<string[]> {
    let ipFinder = new WebRTCIPFinder();
    return ipFinder.findUserIps()
        .catch((err) => {
            console.log('discover', 'Unable to find local ips via WebRTC');
            console.error(err);
            return [];
        }).then((ips:string[]) => {
            let localIps = filterNonLocalIps(ips);
            if (localIps.length === 0) {
                // If we did not find any local ips, guess some common ones
                localIps.push('192.168.0.x');
                localIps.push('192.168.1.x');
            }
            return findFromLocalIps(localIps);
        });
}
