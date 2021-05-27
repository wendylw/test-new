import Utils from './utils';
import dsbridge from 'dsbridge';

export const NATIVE_METHODS = {
  START_CHAT: ({ orderId, phone, name, email, storeName }) => {
    const message = `Order number: ${orderId}\nStore Name: ${storeName}`;
    return {
      method: 'beepModule-startChat',
      params: {
        phoneNumber: phone,
        name,
        email,
        message,
      },
      mode: 'sync',
    };
  },
  GET_ADDRESS: {
    method: 'beepModule-getAddress',
    mode: 'sync',
  },
  GOTO_HOME: {
    method: 'routerModule-closeWebView',
    mode: 'sync',
  },
  GO_BACK: {
    method: 'routerModule-back',
    mode: 'sync',
  },
  GET_LOGIN_STATUS: {
    method: 'userModule-isLogin',
    mode: 'sync',
  },
  GET_TOKEN: touchPoint => {
    return {
      method: 'userModule-getToken',
      params: {
        touchPoint,
      },
      mode: 'async',
    };
  },
  TOKEN_EXPIRED: touchPoint => {
    return {
      method: 'userModule-tokenExpired',
      params: {
        touchPoint,
      },
      mode: 'async',
    };
  },
  SHOW_MAP: {
    method: 'mapModule-showMap',
    mode: 'sync',
  },
  HIDE_MAP: {
    method: 'mapModule-hideMap',
    mode: 'sync',
  },
  UPDATE_RIDER_POSITION: (lat, lng) => {
    return {
      method: 'mapModule-updateRiderPosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
  },
  UPDATE_HOME_POSITION: (lat, lng) => {
    return {
      method: 'mapModule-updateHomePosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
  },
  UPDATE_STORE_POSITION: (lat, lng) => {
    return {
      method: 'mapModule-updateStorePosition',
      params: {
        lat,
        lng,
      },
      mode: 'sync',
    };
  },
  FOCUS_POSITIONS: focusPositionList => {
    return {
      method: 'mapModule-focusPositions',
      params: {
        positions: focusPositionList,
      },
      mode: 'sync',
    };
  },
  NATIVE_LAYOUT: (area, data) => {
    return {
      method: 'nativeLayoutModule-nativeJsConfigLayout',
      params: {
        area,
        data,
      },
      mode: 'sync',
    };
  },
};

const hasNativeSavedAddress = () => {
  if (Utils.isWebview() && sessionStorage.getItem('addressIdFromNative')) {
    return true;
  } else {
    return false;
  }
};

const dsbridgeCall = nativeMethod => {
  const { method, params, mode } = nativeMethod || {};
  const { data: hasNativeMethod } = JSON.parse(
    dsbridge.call('callNative', { method: 'hasNativeMethod', params: { methodName: method } })
  );

  if (!hasNativeMethod) {
    throw new Error("Native side didn't have method: " + method);
  }

  if (mode === 'sync') {
    try {
      let result = dsbridge.call('callNative', { method, params });
      let { code, data, message } = JSON.parse(result);
      if (typeof data === 'undefined' || data === null) {
        return;
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  } else if (mode === 'async') {
    var promise = new Promise(function(resolve, reject) {
      try {
        dsbridge.call('callNativeAsync', { method, params }, function(result) {
          let { code, data, message } = JSON.parse(result);
          resolve(data);
        });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
    return promise;
  }
};

export default {
  dsbridgeCall,
  hasNativeSavedAddress,
};
