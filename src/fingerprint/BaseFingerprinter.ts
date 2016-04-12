import {Promise} from "es6-promise";
import Fingerprinter from "./Fingerprinter";
import FingerprintResult from "./FingerprintResult";
import IPAddress from "../shared/IPAddress";

abstract class BaseFingerprinter implements Fingerprinter {

    private vendor:string;
    private hwVersion:string;
    private fwVersion:string;

    /**
     * Creates a new BaseFingerprinter, representing the vendor, hwVersion
     * and fwVersion provided.
     *
     * @param vendor
     * @param hwVersion
     * @param fwVersion
     */
    constructor(vendor?:string, hwVersion?:string, fwVersion?:string) {
        this.vendor = vendor;
        this.hwVersion = hwVersion;
        this.fwVersion = fwVersion;
    }


    fingerprint(ip:IPAddress):Promise<FingerprintResult[]> {
        return this.testIp(ip).then(testPassed => {
            let results:FingerprintResult[] = [];
            if (testPassed) {
                results.push({
                    ip: ip,
                    vendor: this.vendor,
                    hwVersion: this.hwVersion,
                    fwVersion: this.fwVersion,
                });
            }
            return results;
        });
    }

    /**
     * Method to be overridden by extending classes. The method should
     * take an ip and return a promise that is resolved with true if
     * the ip is of the type the fingerprinter looks for, otherwise
     * false.
     *
     * @param ip
     * @returns {Promise<boolean>}
     */
    protected abstract testIp(ip:IPAddress):Promise<boolean>;
}

export default BaseFingerprinter;
