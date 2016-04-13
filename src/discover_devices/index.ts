import {Promise} from "es6-promise";
import IPAddress from "../shared/IPAddress";
import PromiseUtil from "../shared/PromiseUtil";

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

    console.log('discover_devices', 'ipsToTest', ipsToTest.map(ip => ip.toString()));

    let testPromiseFuncs = ipsToTest.map((ip) => {
        return () => testIp(ip)
    });
    return PromiseUtil.sequentially(testPromiseFuncs).then((ips:IPAddress[]) => {
        return ips.filter(ip => ip != null);
    });
}

/**
 * Attempts to discover interesting ip addresses of possible routers
 * on the private network.
 */
export default function doDiscoverDevices(localIps:IPAddress[]):Promise<IPAddress[]> {
    return findFromLocalIps(localIps);
}
