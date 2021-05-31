import dsbridge from 'dsbridge';
import _ from 'lodash';

const StatusCodes = {
  SUCCESS: '00000',
  PARAM_ERROR: 'A0400',
  METHOD_NOT_EXIST: 'C0113',
  UNKNOWN_ERROR: 'B0001',
};

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
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  getAddress: () => {
    const data = {
      method: 'beepModule-getAddress',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  gotoHome: () => {
    const data = {
      method: 'routerModule-closeWebView',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  goBack: () => {
    const data = {
      method: 'routerModule-back',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  getLoginStatus: () => {
    const data = {
      method: 'userModule-isLogin',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  getToken: touchPoint => {
    const data = {
      method: 'userModule-getToken',
      params: {
        touchPoint,
      },
      mode: 'async',
    };
    return dsbridgeCall(data);
  },
  tokenExpired: touchPoint => {
    const data = {
      method: 'userModule-tokenExpired',
      params: {
        touchPoint,
      },
      mode: 'async',
    };
    return dsbridgeCall(data);
  },
  showMap: () => {
    const data = {
      method: 'mapModule-showMap',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  hideMap: () => {
    const data = {
      method: 'mapModule-hideMap',
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  updateRiderPosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateRiderPosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  updateHomePosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateHomePosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  updateStorePosition: (lat, lng) => {
    const data = {
      method: 'mapModule-updateStorePosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  focusPositions: focusPositionList => {
    const data = {
      method: 'mapModule-focusPositions',
      params: {
        positions: focusPositionList,
      },
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
  nativeLayout: (area, config) => {
    const data = {
      method: 'nativeLayoutModule-nativeJsConfigLayout',
      params: {
        area,
        data: config,
      },
      mode: 'sync',
    };
    return dsbridgeCall(data);
  },
};

const hasMethodInNative = method => {
  try {
    const res = dsbridge.call('callNative', { method: 'hasNativeMethod', params: { methodName: method } });
    return JSON.parse(res);
  } catch (e) {
    throw new Error(e);
  }
};

const dsbridgeCall = nativeMethod => {
  const { method, params, mode } = nativeMethod || {};
  const { data: hasNativeMethod } = hasMethodInNative(method);

  if (!hasNativeMethod) {
    throw new Error("Native side didn't have method: " + method);
  }
  if (mode === 'sync') {
    return dsbridgeSyncCall(method, params);
  } else if (mode === 'async') {
    return dsbridgeAsyncCall(method, params);
  }
};

const dsbridgeSyncCall = (method, params) => {
  try {
    let result = dsbridge.call('callNative', { method, params });
    let { code, data, message } = JSON.parse(result);
    if (_.isNil(data)) {
      return;
    }
    if (
      code === StatusCodes.PARAM_ERROR ||
      code === StatusCodes.METHOD_NOT_EXIST ||
      code === StatusCodes.UNKNOWN_ERROR
    ) {
      console.error(message);
    } else if (code === StatusCodes.SUCCESS) {
      return data;
    }
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
};

const dsbridgeAsyncCall = (method, params) => {
  var promise = new Promise(function(resolve, reject) {
    try {
      dsbridge.call('callNativeAsync', { method, params }, function(result) {
        let { code, data, message } = JSON.parse(result);
        if (
          code === StatusCodes.PARAM_ERROR ||
          code === StatusCodes.METHOD_NOT_EXIST ||
          code === StatusCodes.UNKNOWN_ERROR
        ) {
          reject(new Error(message));
        } else if (code === StatusCodes.SUCCESS) {
          resolve(data);
        }
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
  return promise;
};
