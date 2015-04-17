/**
 * SwpXmlHttpRequest wrapper class, for making life easier in the browser
 *
 * @author Danny Dörfel <danny.dorfel@gmail.com>
 */
(function (root, factory) {
    'use strict';

    // Browser globals
    var SwpXmlHttpRequest = function () {
        return this;
    };

    /*global define:false, exports:false, module:false, SWP:false */
    // exports to multiple
    if (typeof SWP === 'object') { // SWP framework
        SWP.modules.XmlHttpRequest = SwpXmlHttpRequest;
    } else if (typeof define === 'function' && define.amd) { //AMD
        define(function () { return SwpXmlHttpRequest; });
    } else if (module !== undefined && module.exports) { //node
        module.exports = SwpXmlHttpRequest;
    } else { //browser
        root.SwpXmlHttpRequest = SwpXmlHttpRequest;
    }

    factory(SwpXmlHttpRequest);

}((typeof window === 'object' && window) || this, function (SwpXmlHttpRequest) {
    "use strict";

    var encoders, sf2Compatibility = false;

    SwpXmlHttpRequest.xhrVersion = (new XMLHttpRequest().upload) ? 2 : 1;
    SwpXmlHttpRequest.ENCTYPE_URLENCODE = 'application/x-www-form-urlencoded';
    SwpXmlHttpRequest.ENCTYPE_FORMDATA = 'multipart/form-data';
    SwpXmlHttpRequest.ENCTYPE_PLAIN = 'text/plain';

    /*
     * The used encoders if we need to encode the data manually (no FormData avaliable)
     */
    encoders = {
        'application/x-www-form-urlencoded' : function (key, value) {
            return (encodeURIComponent(key) + "=" + encodeURIComponent(value)).replace(/%20/g, '+');
        },
        'multipart/form-data' : function (key, value, boundary) {
            return "------" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"" + key + "\"\r\n\r\n" + value;
        },
        'text/plain' : function (key, value) {
            return (key + "=" + value).replace(/%20/g, '+');
        }
    };

    /**
     * Creates the body data form the data
     * @param {Array|Object} data
     * @param {String|null} boundary
     * @returns {string}
     */
    function encodeData(data, encType, boundary) {
        var i, result, glue, end;

        result = [];
        glue = boundary !== undefined ? "\r\n" : "&";
        end = boundary !== undefined ? "\r\n------" + boundary + "--\r\n" : "";

        for (i in data) {
            if (data.hasOwnProperty(i)) {
                result.push(encoders[encType](i, data[i], boundary));
            }
        }

        return result.join(glue) + end;
    }

    /**
     * Fallback method for retrieving the form element data.
     * @see FormData
     * @param formElm The form html element
     * @returns {{}}
     */
    function getHtmlFormData(formElm) { // retrieve data from html form elements
        var nItem, cField, cFieldType, data;

        data = {};
        for (nItem = 0; nItem < formElm.elements.length; nItem += 1) {
            cField = formElm.elements[nItem];
            cFieldType = cField.getAttribute("type").toUpperCase();
            if (cField.hasAttribute("name") && (cFieldType !== "FILE")) {
                // only named, non-file fields
                data[cField.name] = cField.value;
            }
        }

        return data;
    }

    /**
     * Fills and returns a FormData object with the given object|array data
     * @param data
     * @returns {FormData}
     */
    function buildFormData(data) {
        var form, i;

        form = new FormData();
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                form.append(i, data[i]);
            }
        }

        return form;
    }

    /**
     * Formats the xhr.body data and sets contentType if needed (no FormData object available)
     * @param xhr
     * @param data
     * @returns {*}
     */
    function formatData(xhr, data) {

        var hasFormData, boundary, dataType;

        if (typeof data !== 'object') {
            throw "Data is not an object|array";
        }

        hasFormData = FormData !== undefined;
        boundary = "SwpXhrRequestFormBoundary" + Date.now().toString(16);
        dataType = (data.nodeName !== undefined) && (data.nodeName.toUpperCase() === 'FORM')
            ? 'form' : 'object';

        if (hasFormData && (data instanceof FormData)) {
            xhr.contentType = undefined;
            xhr.body = data;
        } else if (hasFormData) {
            xhr.body = (dataType === 'form') ? new FormData(data) : buildFormData(data);
            xhr.contentType = undefined;
        } else if (dataType === 'form') {
            data.encType = SwpXmlHttpRequest.ENCTYPE_FORMDATA;
            xhr.contentType = data.encType + "; boundary=----" + boundary;
            xhr.body = encodeData(getHtmlFormData(data), data.encType, boundary);
        } else {
            xhr.contentType = data.encType === undefined ? SwpXmlHttpRequest.ENCTYPE_URLENCODE : data.encType;
            xhr.body = encodeData(data, xhr.contentType);
        }

        return xhr;
    }

    /**
     * If sf2compatibility is on, reset the DELETE and PUT method to POST and sets the _method param
     * @param params
     */
    function handleSf2Compatibility(params) {
        var method;

        if ((params.method === undefined)
                || (params.method.toLowerCase() === 'get')
                || (params.method.toLowerCase() === 'post')) {

            return;
        }

        method = params.method.toUpperCase();
        params.method = 'post';

        if (params.data === undefined) {
            params.data = {};
        }

        // Needed because adding a property will not be sufficient
        // The code checks of hasOwnProperty of object.
        if ((params.data.nodeName !== undefined) && (params.data.nodeName.toUpperCase() === 'FORM')) {
            params.data = getHtmlFormData(params.data);
        }

        if (params.data instanceof FormData) {
            params.data.append('_method', method);
        } else {
            params.data._method = method;
        }

        return;
    }

    /**
     * The actual ajax method
     * @param params
     * @returns {Promise}
     */
    function ajax(params) {
        var url = params.url,
            xhrObject;

        if (sf2Compatibility === true) {
            handleSf2Compatibility(params);
        }

        xhrObject = {
            'body' : null,
            'encType' : params.encType !== undefined ? params.encType : SwpXmlHttpRequest.ENCTYPE_URLENCODE,
            'contentType' : params.encType !== undefined ? params.encType : SwpXmlHttpRequest.ENCTYPE_URLENCODE,
            'method' : (params.method !== undefined) ? params.method.toLowerCase() : 'get'
        };

        if (params.data !== undefined) {
            formatData(xhrObject, params.data);
        }

        // it's a get request
        if (xhrObject.method === 'get') {
            url = url + '?' + (xhrObject.body !== null ? xhrObject.body : "") + '+nocache=' + Date.now();
        }

        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest(),
                events = ["loadstart", "progress", "abort", "error", "load", "loadend"],
                event;

            xhr.open(xhrObject.method, url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (xhrObject.contentType !== undefined) {
                xhr.setRequestHeader('Content-Type', xhrObject.contentType);
            }

            if (SwpXmlHttpRequest.xhrVersion === 2) { // xhr2 available so we can do more neat stuff
                for (event in events) {
                    if (events.hasOwnProperty(event) && (typeof params[event] === "Function")) {
                        xhr.upload.addEventListener(event, params[event], false);
                    }
                }
            }

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr, xhr.status);
                }
            };

            xhr.send(xhrObject.body);
        });
    }

    SwpXmlHttpRequest.prototype = {
        sf2Compatibility : function (compat) {
            if (compat !== undefined) {
                sf2Compatibility = compat === true;
            }

            return sf2Compatibility;
        },
        /**
         * @param {Object} data
         * @returns {FormData}
         */
        buildFormData : function (data) {
            return buildFormData(data);
        },
        getHtmlFormData : function (data) {
            return getHtmlFormData(data);
        },
        send : function (params) {
            return ajax(params);
        },
        get : function (params) {
            params.method = 'get';
            return ajax(params);
        },
        post : function (params) {
            params.method = 'post';
            return ajax(params);
        },
        put : function (params) {
            params.method = 'put';
            return ajax(params);
        },
        delete : function (params) {
            params.method = 'delete';
            return ajax(params);
        }
    };
}));
