'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function ajaxCreate(config) {
    var ajax = JsUtils.ajaxCreate(config);
    ajax.interceptors.response.use(
    // STATUS: 2xx
    function (resp) {
        var _respData = __assign({}, resp).data;
        if (_respData.isOk) {
            if (JsUtils.isPlainObject(_respData.data)) {
                // Override: resp.data
                resp.data = _respData;
                // toast success
                if (JsUtils.isStringFilled(_respData.data.toast)) {
                    JsUtils.swalToastSuccess({ title: _respData.data.toast });
                }
            }
            return resp;
        }
        console.log('Not isOk: ', resp);
        console.log(JSON.parse(JSON.stringify(resp)));
        for (var name_1 in resp) {
            if (resp.hasOwnProperty(name_1)) {
                // @ts-ignore
                console.log(name_1, 'this is fog (' + name_1 + ') for sure. Value: ', resp[name_1]);
            }
            else {
                // @ts-ignore
                console.log(name_1, 'this is NOT fog (' + name_1 + '). Value: ' + resp[name_1]);
            }
        }
        ajaxHandleError(resp);
        return false;
    }, 
    // STATUS: NOT 2xx
    function (error) {
        console.log('onRejected error: ', error);
        console.log(JSON.parse(JSON.stringify(error)));
        for (var name_2 in error) {
            if (error.hasOwnProperty(name_2)) {
                // @ts-ignore
                console.log(name_2, 'YES fog (' + name_2 + ') for sure. Value: ', error[name_2]);
            }
            else {
                // @ts-ignore
                console.log(name_2, 'NO fog (' + name_2 + '). Value: ', error[name_2]);
            }
            // @ts-ignore
            if (JsUtils.isPlainObject(error[name_2])) {
                // @ts-ignore
                console.log('isPlainObject: ', JSON.stringify(error[name_2]));
            }
            // @ts-ignore
            if (JsUtils.isFunction(error[name_2])) {
                // @ts-ignore
                console.log('isFunction: ', error[name_2]());
            }
        }
        ajaxHandleError(error);
        // return Promise.reject(error);
        return false;
    });
    return ajax;
}
function ajaxHandleError(resp) {
    var err;
    if (typeof resp === "undefined") {
        return;
    }
    // @ts-ignore
    var Resp_Message = resp.message;
    // @ts-ignore
    var Resp_Response = resp.response;
    // Special Case 1: blocked by CORS
    if (JsUtils.isString(Resp_Message)) {
        JsUtils.swalAlert(Resp_Message);
        return;
    }
    // Special Case 2: HTTP-STATUS !== 200
    if (!JsUtils.isNil(resp.config) && JsUtils.isObject(Resp_Response)) {
        resp = Resp_Response;
    }
    var _respData = __assign({}, resp).data;
    err = JsUtils.isStringFilled(_respData.err) ? _respData.err : '网络繁忙（400400），请稍后再试';
    if (_respData.retCode >= 500) {
        err = '网络繁忙（400500），请稍后再试';
    }
    else if (_respData.retCode === 401) {
        err = "\u7F51\u7EDC\u7E41\u5FD9\uFF08400401\uFF09\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5";
    }
    else if (_respData.retCode === 403) {
        err = '网络繁忙（400403），请稍后再试';
    }
    else if (_respData.retCode === 404) {
        err = '网络繁忙（400404），请稍后再试';
    }
    else if (_respData.retCode >= 400) {
        if (JsUtils.isArray(_respData.data)) {
            if (JsUtils.isObject(_respData.data[0])) {
                if (JsUtils.isStringFilled(_respData.data[0].message)) {
                    // {
                    //   retCode: 4xx,
                    //   data: [
                    //     {message: "An error occurred!"},
                    //     ...
                    //   ]
                    // }
                    err = _respData.data[0].message;
                }
            }
        }
        else if (JsUtils.isObject(_respData.data)) {
            if (JsUtils.isStringFilled(_respData.data.err)) {
                // {
                //   retCode: 4xx,
                //   data: {
                //     err: "An error occurred!"
                //   }
                // }
                err = _respData.data.err;
            }
            else if (JsUtils.isObject(_respData.data.err)) {
                var errors = Object.values(_respData.data.err);
                if (JsUtils.isStringFilled(errors[0])) {
                    // {
                    //   retCode: 4xx,
                    //   data: {
                    //     err: {
                    //       desc: "An error occurred!"
                    //     }
                    //   }
                    // }
                    err = errors[0];
                }
                else if (JsUtils.isArray(errors[0])) {
                    if (JsUtils.isStringFilled(errors[0][0])) {
                        // {
                        //   retCode: 4xx,
                        //   data: {
                        //     err: {
                        //       desc: ["An error occurred!"]
                        //     }
                        //   }
                        // }
                        err = errors[0][0];
                    }
                }
            }
            else if (JsUtils.isStringFilled(_respData.data.message)) {
                // {
                //   retCode: 4xx,
                //   data: {
                //     message: "An error occurred!"
                //   }
                // }
                err = _respData.data.message;
            }
        }
    }
    err = JsUtils.isNil(err) ? '网络繁忙（400000），请稍后再试' : err;
    JsUtils.swalAlert({
        html: "<p>" + err + "</p>",
        confirmButtonText: '关 闭',
    });
}

exports.ajaxCreate = ajaxCreate;
exports.ajaxHandleError = ajaxHandleError;
