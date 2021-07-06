import dsBridge from 'dsbridge';
import loggly from './monitoring/loggly';

const MODE = {
  SYNC: 'sync',
  ASYNC: 'async',
};

export const NATIVE_API_ERROR_CODES = {
  SUCCESS: '00000',
  PARAM_ERROR: 'A0400',
  METHOD_NOT_EXIST: 'C0113',
  UNKNOWN_ERROR: 'B0001',
};

export class NativeAPIError extends Error {
  constructor(message, code = NATIVE_API_ERROR_CODES.UNKNOWN_ERROR, extra) {
    super(message);
    this.code = code;
    this.extra = extra;
  }

  //Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      extra: this.extra,
    };
  }
}

export const NativeMethods = {
  startChat: ({ orderId, phone, name, email, storeName }) => {
    const message = `Order number: ${orderId}\nStore Name: ${storeName}`;
    const data = {
      method: 'beepModule-startChat',
      params: {
        phoneNumber: phone,
        name,
        email,
        message,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  getAddress: () => {
    const data = {
      method: 'beepModule-getAddress',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  closeWebView: () => {
    const data = {
      method: 'routerModule-closeWebView',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  goBack: () => {
    const data = {
      method: 'routerModule-back',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  getLoginStatus: () => {
    const data = {
      method: 'userModule-isLogin',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  getTokenAsync: touchPoint => {
    const data = {
      method: 'userModule-getToken',
      params: {
        touchPoint,
      },
      mode: MODE.ASYNC,
    };
    return dsBridgeCall(data);
  },
  tokenExpiredAsync: touchPoint => {
    const data = {
      method: 'userModule-tokenExpired',
      params: {
        touchPoint,
      },
      mode: MODE.ASYNC,
    };
    return dsBridgeCall(data);
  },
  showMap: () => {
    const data = {
      method: 'mapModule-showMap',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  hideMap: () => {
    const data = {
      method: 'mapModule-hideMap',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  updateRiderPosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateRiderPosition',
      params: {
        lat,
        lng,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  updateHomePosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateHomePosition',
      params: {
        lat,
        lng,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  updateStorePosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateStorePosition',
      params: {
        lat,
        lng,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  focusPositions: focusPositionList => {
    const data = {
      method: 'mapModule-focusPositions',
      params: {
        positions: focusPositionList,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  nativeLayout: (area, config) => {
    const data = {
      method: 'nativeLayoutModule-nativeJsConfigLayout',
      params: {
        area,
        data: config,
      },
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
  gotoHome: () => {
    const data = {
      method: 'routerModule-gotoHome',
      mode: MODE.SYNC,
    };
    return dsBridgeCall(data);
  },
};

const hasMethodInNative = method => {
  try {
    const { data: hasNativeMethod } = JSON.parse(
      dsBridge.call('callNative', { method: 'hasNativeMethod', params: { methodName: method } })
    );
    return hasNativeMethod;
  } catch (e) {
    loggly.error('dsBridge-methods.hasNativeMethod', { message: e });
    return false;
  }
};

const dsBridgeCall = nativeMethod => {
  const { method, params, mode } = nativeMethod || {};
  const hasNativeMethod = hasMethodInNative(method);

  if (!hasNativeMethod) {
    throw new NativeAPIError(`Couldn't find the method: ${method}`, NATIVE_API_ERROR_CODES.METHOD_NOT_EXIST, {
      method,
    });
  }

  switch (mode) {
    case MODE.SYNC:
      return dsBridgeSyncCall(method, params);
    case MODE.ASYNC:
      return dsBridgeAsyncCall(method, params);
    default:
      throw new NativeAPIError("'mode' should be one of 'sync' or 'async'", NATIVE_API_ERROR_CODES.INVALID_ARGUMENT, {
        mode,
      });
  }
};

const dsBridgeSyncCall = (method, params) => {
  try {
    const result = dsBridge.call('callNative', { method, params });

    console.log('Call native method: %s\n\nparams: %s\n\nresult: %s\n\n', method, JSON.stringify(params), result);

    const { code, data, message } = JSON.parse(result);

    if (code !== NATIVE_API_ERROR_CODES.SUCCESS) {
      throw new NativeAPIError(message, code, data);
    }

    return data;
  } catch (error) {
    const errorData = error instanceof NativeAPIError ? error : { message: error.message || error.toString() };

    loggly.error(`dsBridge-methods.${method}`, errorData);

    throw error;
  }
};

const dsBridgeAsyncCall = (method, params) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Call async native method: %s\n\nparams: %s\n\n');

      dsBridge.call('callNativeAsync', { method, params }, result => {
        const { code, data, message } = JSON.parse(result);

        console.log(
          'Call async native method: %s\n\nparams: %s\n\nresult: %s\n\n',
          method,
          JSON.stringify(params),
          result
        );

        if (code !== NATIVE_API_ERROR_CODES.SUCCESS) {
          throw new NativeAPIError(message, code, data);
        }

        resolve(data);
      });
    } catch (error) {
      const errorData = error instanceof NativeAPIError ? error : { message: error.message || error.toString() };

      loggly.error(`dsBridge-methods.${method}`, errorData);

      reject(error);
    }
  });
};
