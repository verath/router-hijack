/**
 * A result of a fingerprinting of an ip.
 */
interface FingerprintResult {
    /**
     * Ip of the router, e.g. "192.168.1.254"
     */
    ip:String,

    /**
     * Vendor of the router, e.g. "NETGEAR"
     */
    vendor:String,

    /**
     * Hardware version, e.g. "WNDR3700"
     */
    hwVersion:String,

    /**
     * Firmware version. E.g. "1.0.7.98"
     */
    fwVersion:String
}

export default FingerprintResult;
