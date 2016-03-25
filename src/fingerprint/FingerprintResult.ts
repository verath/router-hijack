/**
 * A result of a fingerprinting of an ip.
 */
interface FingerprintResult {
    /**
     * Ip of the router, e.g. "192.168.1.254"
     */
    ip:string,

    /**
     * Vendor of the router, e.g. "NETGEAR"
     */
    vendor?:string,

    /**
     * Hardware version, e.g. "WNDR3700"
     */
    hwVersion?:string,

    /**
     * Firmware version. E.g. "1.0.7.98"
     */
    fwVersion?:string
}

export default FingerprintResult;
