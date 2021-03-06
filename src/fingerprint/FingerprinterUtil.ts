import {Promise} from "es6-promise";
import PromiseUtil from "../shared/PromiseUtil";

interface ScriptVerifyFunction {
    (context:Window):boolean
}

/**
 * A utility class for shared functionallity between the
 * fingerprinters.
 */
export default class FingerprinterUtil {

    /**
     * Attempts to load an image at the url. Returns a promise resolved with a
     * boolean for if the image was loaded within the timeout or not.
     *
     * @param imageUrl Url of the image to load.
     * @param [timeout=1000] Time to wait for the image to load (ms).
     * @returns {Promise<boolean>}
     */
    static tryLoadImage(imageUrl:string, timeout:number = 1000):Promise<boolean> {
        return new Promise(resolve => {
            let image:HTMLImageElement = document.createElement("img");
            let timeoutId:number;
            let done = (success:boolean, reason:string) => {
                clearTimeout(timeoutId);
                image.removeEventListener('load', onLoad);
                image.removeEventListener('error', onError);
                image.remove();
                resolve(success);
                console.log('tryLoadImage', imageUrl, success, reason);
            };
            let onLoad = () => done(true, 'onLoad');
            let onError = () => done(false, 'onError');
            let onTimeout = () => done(false, 'onTimeout');

            image.src = imageUrl;
            image.style.display = 'none';
            image.addEventListener('load', onLoad);
            image.addEventListener('error', onError);

            document.body.appendChild(image);
            timeoutId = setTimeout(onTimeout, timeout);
        });
    }

    /**
     * Attempts to load all images provided. Returns a promise resolved with a
     * boolean for if all the images were loaded within the timeout or not.
     *
     * @param imageUrls Urls of the images to load.
     * @param [timeout=1000] Time to wait for each image to load (ms).
     * @returns {Promise<boolean>}
     */
    static tryLoadAllImages(imageUrls:string[], timeout:number = 1000):Promise<boolean> {
        let loadPromiseFuncs = imageUrls.map(url => {
            return () => FingerprinterUtil.tryLoadImage(url, timeout)
        });
        return PromiseUtil.sequentially(loadPromiseFuncs).then((loadResults:boolean[]) => {
            return loadResults.every(r => r);
        });
    }

    /**
     * Attempts to load and run a script. The script is executed within an iframe, to
     * keep the script's execution separate from the global window object. After the
     * script has loaded, the verifyFunc is called with the window object of the frame
     * where the script was run. This can be used to check for e.g. properties set on
     * the window by the script.
     *
     * @param scriptUrl The Url of the script to load and run
     * @param verifyFunc A function that takes a window object of the frame where the
     *                  script was executed and returns a boolean indicating whether
     *                  the script did was what expected (e.g. if it did set certain
     *                  variables).
     * @param [timeout=1000] Time to wait for the script to load (ms).
     * @returns {Promise<boolean>}
     */
    static tryRunScript(scriptUrl:string, verifyFunc:ScriptVerifyFunction, timeout:number = 1000):Promise<boolean> {
        return new Promise((resolve) => {
            let frame:HTMLIFrameElement = document.createElement('iframe');
            let script:HTMLScriptElement = document.createElement('script');
            let timeoutId:number;
            let done = (success:boolean, reason:string) => {
                clearTimeout(timeoutId);
                script.removeEventListener('load', onScriptLoad);
                script.removeEventListener('error', onScriptError);
                script.remove();
                frame.remove();
                resolve(success);
                console.log('tryRunScript', scriptUrl, success, reason);
            };
            let onScriptLoad = () => {
                let success = verifyFunc(frame.contentWindow);
                done(success, 'onScriptLoad');
            };
            let onScriptError = () => done(false, 'onScriptError');
            let onTimeout = () => done(false, 'onTimeout');

            frame.sandbox.add('allow-scripts', 'allow-same-origin');
            frame.style.display = 'none';
            script.src = scriptUrl;
            script.addEventListener('load', onScriptLoad);
            script.addEventListener('error', onScriptError);

            frame.onload = () => {
                frame.contentWindow.document.body.appendChild(script);
            };
            document.body.appendChild(frame);
            timeoutId = setTimeout(onTimeout, timeout);
        });
    }

    /**
     * Attempts to load all scripts provided. Returns a promise resolved with a
     * boolean for if the script was loaded within the timeout or not. This is
     * simply wrapper around tryRunScript, providing an always true verifyFunc.
     *
     * @see tryRunScript
     * @param scriptUrl
     * @param timeout
     * @returns {Promise<boolean>}
     */
    static tryLoadScript(scriptUrl:string, timeout:number = 1000):Promise<boolean> {
        return FingerprinterUtil.tryRunScript(scriptUrl, () => true, timeout);
    }
}

