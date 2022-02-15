import type * as Axios_T from "axios";
import type * as JsUtils_T from "@charescape/js-utils";

declare const JsUtils: typeof JsUtils_T;

export function ajaxCreate(config?: Axios_T.AxiosRequestConfig): Axios_T.AxiosInstance {
  const ajax = JsUtils.ajaxCreate(config);

  ajax.interceptors.response.use(
    // STATUS: 2xx
    (resp: Axios_T.AxiosResponse): any => {
      if (resp.config.responseType === 'blob') {
        return resp;
      }

      // normalize headers
      const _resp_headers = {...resp.headers};
      const _normalized_headers = {};

      Object.keys(_resp_headers).forEach((k: string) => {
        let name: string = k.toLowerCase();
        let value: any = _resp_headers[k];

        // for special headers
        if (name.indexOf('x-pagination-') === 0) {
          value *= 1;
        }

        // @ts-ignore
        _normalized_headers[name] = value;
      });

      // override: resp.headers
      resp.headers = _normalized_headers;

      const _respData: {isOk: boolean, retCode: number, data?: any, err?: string} = {...resp}.data;

      if (_respData.isOk) {
        if (JsUtils.isPlainObject(_respData.data)) {
          // Override: resp.data
          resp.data = _respData.data;

          // toast success
          if (JsUtils.isStringFilled(resp.data.toast)) {
            JsUtils.swalToastSuccess({title: resp.data.toast});
          }
        }

        return resp;
      }

      ajaxHandleError(resp);

      return false;
    },
    // STATUS: NOT 2xx
    (error: Axios_T.AxiosError): false => {

      ajaxHandleError(error);

      // return Promise.reject(error);

      return false;
    }
  );

  return ajax;
}

export function ajaxHandleError(resp: Axios_T.AxiosResponse | Axios_T.AxiosError): void {
  let err: string;

  if (resp instanceof Error) {
    // Error Case 1: blocked by CORS
    if (JsUtils.isNil(resp.response)) {
      JsUtils.swalAlert({
        text: `网络繁忙（400001），请稍后再试`,
        confirmButtonText: '关 闭',
      });
      return;
    }

    // Error Case 2: HTTP_STATUS !== 200
    if (JsUtils.isObject(resp.response) && !JsUtils.isNil(resp.response?.data)) {
      // @ts-ignore
      resp = resp.response;
    }
  }

  // @ts-ignore
  const _respData: {isOk: boolean, retCode: number, data?: any, err?: string} = {...resp}.data;

  err = '网络繁忙（400000），请稍后再试';
  if ((typeof _respData.err === "string") && JsUtils.isStringFilled(_respData.err)) {
    err = _respData.err;
  }

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

  JsUtils.swalAlert({
    text: err,
    confirmButtonText: '关 闭',
  });
}
