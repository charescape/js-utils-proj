import type * as Axios_T from "axios";
import type * as JsUtils_T from "@charescape/js-utils";

declare const JsUtils: typeof JsUtils_T;

export function ajaxCreate(config?: Axios_T.AxiosRequestConfig): Axios_T.AxiosInstance {
  const ajax = JsUtils.ajaxCreate(config);

  ajax.interceptors.response.use(
    // STATUS: 2xx
    (resp: Axios_T.AxiosResponse): any => {
      const _respData: {isOk: boolean, retCode: number, data?: any, err?: string} = {...resp}.data;

      if (_respData.isOk) {
        if (JsUtils.isPlainObject(_respData.data)) {
          // Override: resp.data
          resp.data = _respData;

          // toast success
          if (JsUtils.isStringFilled(_respData.data.toast)) {
            JsUtils.swalToastSuccess({title: _respData.data.toast});
          }
        }

        return resp;
      }

      console.log('Not isOk: ', resp);
      for (let name in resp) {
        if (resp.hasOwnProperty(name)) {
          // @ts-ignore
          console.log(name, 'YES(Not isOk) fog (' + name + ') for sure. Value: ', resp[name]);
        } else {
          // @ts-ignore
          console.log(name, 'NO(Not isOk) fog (' + name + '). Value: ', resp[name]);
        }
        // @ts-ignore
        if (JsUtils.isPlainObject(resp[name])) {
          // @ts-ignore
          console.log('isPlainObject(Not isOk): ', JSON.stringify(resp[name]));
        }
        // @ts-ignore
        if (JsUtils.isFunction(resp[name])) {
          // @ts-ignore
          console.log('isFunction(Not isOk): ', resp[name]());
        }
      }

      ajaxHandleError(resp);

      return false;
    },
    // STATUS: NOT 2xx
    (error: Axios_T.AxiosError): false => {
      console.log('onRejected error: ', error);
      for (let name in error) {
        if (error.hasOwnProperty(name)) {
          // @ts-ignore
          console.log(name, 'YES(onRejected) fog (' + name + ') for sure. Value: ', error[name]);
        } else {
          // @ts-ignore
          console.log(name, 'NO(onRejected) fog (' + name + '). Value: ', error[name]);
        }
        // @ts-ignore
        if (JsUtils.isPlainObject(error[name])) {
          // @ts-ignore
          console.log('isPlainObject(onRejected): ', JSON.stringify(error[name]));
        }
        // @ts-ignore
        if (JsUtils.isFunction(error[name])) {
          // @ts-ignore
          console.log('isFunction(onRejected): ', error[name]());
        }
      }

      ajaxHandleError(error);

      // return Promise.reject(error);

      return false;
    }
  );

  return ajax;
}

export function ajaxHandleError(resp?: Axios_T.AxiosResponse | Axios_T.AxiosError): void {
  let err: string | undefined;

  if (typeof resp === "undefined") {
    return;
  }

  // @ts-ignore
  const Resp_Message: any = resp.message;
  // @ts-ignore
  const Resp_Response: any = resp.response;

  // Special Case 1: blocked by CORS
  if (JsUtils.isString(Resp_Message)) {
    JsUtils.swalAlert(Resp_Message);
    return;
  }

  // Special Case 2: HTTP-STATUS !== 200
  if (!JsUtils.isNil(resp.config) && JsUtils.isObject(Resp_Response)) {
    resp = Resp_Response;
  }


  const _respData: {isOk: boolean, retCode: number, data?: any, err?: string} = {...resp}.data;

  err = JsUtils.isStringFilled(_respData.err) ? _respData.err : '网络繁忙（400400），请稍后再试';

  if (_respData.retCode >= 500) {
    err = '网络繁忙（400500），请稍后再试';
  } else if (_respData.retCode === 401) {
    err = `网络繁忙（400401），请稍后再试`;
  } else if (_respData.retCode === 403) {
    err = '网络繁忙（400403），请稍后再试';
  } else if (_respData.retCode === 404) {
    err = '网络繁忙（400404），请稍后再试';
  } else if (_respData.retCode >= 400) {
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
    } else if (JsUtils.isObject(_respData.data)) {
      if (JsUtils.isStringFilled(_respData.data.err)) {
        // {
        //   retCode: 4xx,
        //   data: {
        //     err: "An error occurred!"
        //   }
        // }
        err = _respData.data.err;
      } else if (JsUtils.isObject(_respData.data.err)) {
        const errors: any[] = Object.values(_respData.data.err);
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
        } else if (JsUtils.isArray(errors[0])) {
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
      } else if (JsUtils.isStringFilled(_respData.data.message)) {
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
    html: `<p>${err}</p>`,
    confirmButtonText: '关 闭',
  });
}
