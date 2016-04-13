import {Promise} from "es6-promise";

interface PromiseFunction<T> {
    ():Promise<T>
}

class PromiseUtil {

    /**
     * Make a promise from an array of promiseFunctions run sequentially.
     * The fulfillment value is an array (in order) of fulfillment values.
     * The rejection value is the first rejection value.
     *
     * @param promiseFunctions
     * @returns {Promise<T[]>}
     */
    static sequentially<T>(promiseFunctions:PromiseFunction<T>[]):Promise<T[]> {
        if (promiseFunctions == null) {
            throw new Error('promiseFunctions can not be null');
        }
        let promise:Promise<T[]> = Promise.resolve([]);
        for (let i = 0; i < promiseFunctions.length; i++) {
            let currentFunction = promiseFunctions[i];
            promise = promise.then((prevResult:T[]) => {
                return currentFunction().then((currResult:T) => {
                    return prevResult.concat(currResult);
                });
            });
        }
        return promise;
    }
}

export default PromiseUtil;