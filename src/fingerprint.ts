import {Promise} from 'es6-promise';

/**
 * A Fingerprint result for a successfully identified router.
 * @typedef {Object} FingerprintResult
 * @property {string} ip
 * @property {string} vendor
 * @property {string} hwVersion
 * @property {string} fwVersion
 */

/**
 *
 * @param ip
 * @returns {Promise}
 */
function testIp(ip) {
    return new Promise((resolve) => {
        let languageSrc = `http://${ip}/languages-en.js`;
        let frame = document.createElement('iframe');
        frame.style.display = 'none';

        let done = (success) => {
            languageScript.remove();
            frame.remove();
            resolve(success ? ip : null);
        };

        let languageScript = document.createElement('script');
        languageScript.src = languageSrc;
        languageScript.addEventListener('load', () => {
            let isMatch = (frame.contentWindow['know_href'] === "http://kbserver.netgear.com/wndr3700.asp");
            done(isMatch);
        });
        languageScript.addEventListener('error', () => done(false));

        document.body.appendChild(frame);
        frame.contentWindow.document.body.appendChild(languageScript);
    });
}

/**
 *
 * @param ip
 * @returns FingerprintResult
 */
function ipToFingerprintResult(ip) {
    // We only match one router atm
    return {
        ip: ip,
        vendor: 'NETGEAR',
        hwVersion: 'WNDR3700',
        fwVersion: '1.0.7.98'
    }
}

/**
 * Takes an array of ips and attempts to find out what (if any) router
 * is running at that ip.
 *
 * @param ips {Array}
 * @returns {Promise.<FingerprintResult>}
 */
export default function fingerprint(ips) {
    let testPromises = ips.map(testIp);
    return Promise.all(testPromises).then((ips) => {
       return ips.filter((ip) => ip != null).map(ipToFingerprintResult)
    });
}
