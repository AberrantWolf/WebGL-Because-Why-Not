// A class for loading any piece of text. Includes functions for checking
// if it's been loaded yet.
class BWN_LoadableBase {
    /**
     * 
     * @param {string} file_uri 
     */
    constructor(file_uri) {
        let this_ = this;
        this._status = "LOADING";

        this_.promise = new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.responseType = this_.getResponseType();
            xhttp.onreadystatechange = () => {
                this_.handleXHRResult(xhttp, resolve, reject);
            };
            xhttp.open("GET", file_uri, true);
            xhttp.send();
        });

        this_.promise.then(() => {
                this_._status = "SUCCESS";
                //console.log("Loaded text file [" + file_uri + "]");
            }
        ).catch((reason) => {
                this_._status = "FAIL";
                console.log("Failed to load file [" + file_uri + "] due to " + reason);
            }
        );
    }

    getResponseType() {
        return 'text';
    }

    /**
     * 
     * @param {XMLHttpRequest} xhttp 
     */    
    handleXhttpSuccess(xhttp) {
        this.value = xhttp.response;
        console.log("Loaded text: " + this.value);
    }

    /**
     * 
     * @param {XMLHttpRequest} xhttp 
     * @param {function} resolve 
     * @param {function} reject 
     */    
    handleXHRResult (xhttp, resolve, reject) {
        if (xhttp.readyState == 4) {
            // SUCCESS
            if (xhttp.status == 200) {
                this.handleXhttpSuccess(xhttp);
                resolve();
            }
            // NOT... SUCCESS
            else {
                reject("XHTTP failure: " + xhttp.status);
            }
        }
    }

    get() {
        return this.value;
    }

    get status() {
        return this._status;
    }

    isReady() {
        return this._status === "SUCCESS";
    }

    /**
     * 
     * @param {function} func 
     */    
    onReady(func) {
        this.promise.then(func);
    }
}

// The base actually is a text version, so just extend it simply...
class BWN_LoadableText extends BWN_LoadableBase {}