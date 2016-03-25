import {Promise} from 'es6-promise';

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
}

