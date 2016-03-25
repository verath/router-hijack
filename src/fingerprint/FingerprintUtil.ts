import {Promise} from "es6-promise";

interface ScriptVerifyFunction {
    (context:Window):boolean
}

export default class FingerprintUtil {

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
                if (image != null) {
                    image.remove();
                    image = null;
                }
                clearTimeout(timeoutId);
                resolve(success);
            };
            image.src = imageUrl;
            image.addEventListener('loadstart', () => {
                console.log('loadstart')
            });
            image.addEventListener('load', () => done(true));
            image.addEventListener('error', () => done(false));
            image.style.display = 'none';
            document.body.appendChild(image);
            timeoutId = setTimeout(() => done(false), timeout);
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
        let loadPromises = imageUrls.map(url => FingerprintUtil.tryLoadImage(url, timeout));
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
                if (script != null) {
                    script.remove();
                    script = null;
                }
                if (frame != null) {
                    frame.remove();
                    frame = null;
                }
                clearTimeout(timeoutId);
                resolve(success);
            };

            frame.sandbox.add('allow-scripts', 'allow-same-origin');
            frame.style.display = 'none';
            script.src = scriptUrl;
            script.addEventListener('load', () => {
                let success = verifyFunc(frame.contentWindow);
                done(success);
            });
            script.addEventListener('error', () => done(false));

            document.body.appendChild(frame);
            frame.contentWindow.document.body.appendChild(script);
            timeoutId = setTimeout(() => done(false), timeout);
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
        return FingerprintUtil.tryRunScript(scriptUrl, () => true, timeout);
    }
}

