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
      console.log(JSON.parse(JSON.stringify(resp)));

      ajaxHandleError(resp);

      return false;
    },
    // STATUS: NOT 2xx
    (error: Axios_T.AxiosError): false => {
      console.log('onRejected error: ', error);
      console.log(JSON.parse(JSON.stringify(error)));

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
  if (JsUtils.isNil(resp.config) && JsUtils.isString(Resp_Message)) {
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
