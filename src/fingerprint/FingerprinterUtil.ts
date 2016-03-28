import {Promise} from "es6-promise";

interface ScriptVerifyFunction {
    (context:Window):boolean
}

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
            let done = (success:boolean) => {
                clearTimeout(timeoutId);
                image.removeEventListener('load', onLoad);
                image.removeEventListener('error', onError);
                image.remove();
                resolve(success);
            };
            let onLoad = () => done(true);
            let onError = () => done(false);
            let onTimeout = () => done(false);

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
     * Note: The timeout is for each image, but does not account for idle time
     * due to other images being loaded simultaneously.
     *
     * @param imageUrls Urls of the images to load.
     * @param [timeout=1000] Time to wait for each image to load (ms).
     * @returns {Promise<boolean>}
     */
    static tryLoadAllImages(imageUrls:string[], timeout:number = 1000):Promise<boolean> {
        let loadPromises = imageUrls.map(url => FingerprinterUtil.tryLoadImage(url, timeout));
        return Promise.all(loadPromises).then((loadResults:boolean[]) => {
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
            let done = (success:boolean) => {
                clearTimeout(timeoutId);
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                script.remove();
                frame.remove();
                resolve(success);
            };
            let onLoad = () => {
                let success = verifyFunc(frame.contentWindow);
                done(success);
            };
            let onError = () => done(false);
            let onTimeout = () => done(false);

            frame.sandbox.add('allow-scripts', 'allow-same-origin');
            frame.style.display = 'none';
            script.src = scriptUrl;
            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);

            document.body.appendChild(frame);
            frame.contentWindow.document.body.appendChild(script);
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

