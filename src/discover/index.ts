import {Promise} from "es6-promise";
import WebRTCIPFinder from "./WebRTCIPFinder";
import IPAddress from "../shared/IPAddress";

function testIp(ip:IPAddress):Promise<IPAddress> {
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

function findFromLocalIps(localIps:IPAddress[]):Promise<IPAddress[]> {
    // Assume subnet mask is 255.255.255.0 and that router is in
    // bottom or top 5 ips of subnet
    let routerIpSuffixes:number[] = [
        0, 1, 2, 3, 4,
        250, 251, 252, 253, 254
    ];

    let ipsToTest:IPAddress[] = [];
    for (let ip of localIps) {
        let ipParts = ip.getAddressBytes();
        let localSubnet = [ipParts[0], ipParts[1], ipParts[2]];
        routerIpSuffixes.forEach((suffix) => {
            let ipAddress = new IPAddress(localSubnet.concat(suffix));
            ipsToTest.push(ipAddress);
        });
    }

    console.log('discover', 'ipsToTest', ipsToTest.map(ip => ip.toString()));

    let testPromises = ipsToTest.map(testIp);
    return Promise.all(testPromises).then((ips) => {
        return ips.filter((ip) => ip != null);
    });
}

/**
 * Attempts to discover interesting ip addresses of possible routers
 * on the private network.
 */
export default function doDiscover():Promise<IPAddress[]> {
    return WebRTCIPFinder.findUserIps()
        .catch((err) => {
            console.log('discover', 'Unable to find local ips via WebRTC');
            console.error(err);
            return [];
        }).then((ips:IPAddress[]) => {
            let localIps = ips.filter((ip:IPAddress) => ip.isPrivate());
            if (localIps.length === 0) {
                // If we did not find any local ips, guess some common ones
                localIps.push(IPAddress.fromString('192.168.0.0'));
                localIps.push(IPAddress.fromString('192.168.1.0'));
            }
            return findFromLocalIps(localIps);
        });
}
