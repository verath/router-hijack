import {Promise} from "es6-promise";
import IPAddress from "../shared/IPAddress";
import PromiseUtil from "../shared/PromiseUtil";

/**
 * Tests if an ip looks like it might host a device. This is
 * done by sending a request, and seeing if the request is
 * resolved before a timeout. As the device is on another
 * domain, it is assumed that an error will be raised (due to
 * cross origin policies) if the request was successful.
 *
 * @param ip The ip to test.
 * @returns {Promise<IPAddress>} A promise resolved with the tested ip
 * if the ip is thought to host a device. Otherwise the promise is
 * resolved with null.
 */
function testIp(ip:IPAddress):Promise<IPAddress> {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        let done = (success:boolean, reason:string) => {
            xhr.onload = null;
            xhr.onerror = null;
            xhr.ontimeout = null;
            xhr.abort();
            resolve(success ? ip : null);
            console.log('testIp', `http://${ip}/`, success, reason);
        };
        xhr.open('GET', `http://${ip}/`, true);
        xhr.timeout = 1000;
        xhr.onload = () => done(true, 'onload');
        // We assume onerror is called only because the request
        // was denied for cross domain reasons. If that holds,
        // we also know that if we get an error instead of a
        // timeout, there is likely a web server at the ip.
        xhr.onerror = () => done(true, 'onerror');
        xhr.ontimeout = () => done(false, 'ontimeout');
        xhr.send(null);
    });
}

/**
 * Takes an array of local ips to test, and returns a new array holding
 * only ips that might have a router (= it seems respond to web requests).
 *
 * @param localIps
 * @returns {Promise<IPAddress[]>} Promise resolved with an array of ip
 * addresses of possible devices.
 */
function findFromLocalIps(localIps:IPAddress[]):Promise<IPAddress[]> {
    // Assume subnet mask is 255.255.255.0, and that router is in
    // bottom or top 4 ips of subnet.
    // Note that .0 and .255 is thought to be illegal/not used.
    // https://en.wikipedia.org/wiki/IPv4#Addresses_ending_in_0_or_255
    let routerIpSuffixes:number[] = [
        1, 2, 3, 4,
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

    console.log('discover_devices', 'ipsToTest', ipsToTest.map(ip => ip.toString()));

    let testPromiseFuncs = ipsToTest.map((ip) => {
        return () => testIp(ip)
    });
    return PromiseUtil.sequentially(testPromiseFuncs).then((ips:IPAddress[]) => {
        return ips.filter(ip => ip != null);
    });
}

/**
 * Attempts to discover interesting ip addresses of possible devices
 * on the private network.
 */
export default function doDiscoverDevices(localIps:IPAddress[]):Promise<IPAddress[]> {
    return findFromLocalIps(localIps);
}
