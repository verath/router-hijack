import {Promise} from "es6-promise";
import IPAddress from "../shared/IPAddress";
import WebRTCIPFinder from "./WebRTCIPFinder";

/**
 * Function that attempt to find local ip(s) of the visitor,
 * using the {@link WebRTCIPFinder}.
 *
 * @returns {Promise<IPAddress[]>} A promise for an array of ip addresses,
 * representing the local ip addresses of the visitor.
 */
export default function doLocalIp():Promise<IPAddress[]> {
    return WebRTCIPFinder.findUserIps()
        .catch((err) => {
            console.log('local_ip', 'Unable to find local ip(s) via WebRTC');
            console.error(err);
            return [];
        }).then((ips:IPAddress[]) => {
            let localIps = ips.filter((ip:IPAddress) => ip.isPrivate());
            // If we did not find any local ips, guess some common ones
            if (localIps.length === 0) {
                localIps.push(IPAddress.fromString('192.168.0.0'));
                localIps.push(IPAddress.fromString('192.168.1.0'));
            }
            return localIps;
        });
}
