import Utils from './utils';
import dsbridge from 'dsbridge';

export const NATIVE_METHODS = {
  START_CHAT: (phone, name, email, message) => {
    return {
      method: 'beepModule-startChat',
      params: {
        phoneNumber: phone,
        name,
        email,
        message,
      },
      call: 'sync',
    };
  },
  GET_ADDRESS: {
    method: 'beepModule-getAddress',
    call: 'sync',
  },
  GOTO_HOME: {
    method: 'routerModule-closeWebView',
    call: 'sync',
  },
  GET_LOGIN_STATUS: {
    method: 'userModule-isLogin',
    call: 'sync',
  },
  GET_TOKEN: {
    method: 'userModule-getToken',
    call: 'async',
  },
  TOKEN_EXPIRED: {
    method: 'userModule-tokenExpired',
    call: 'sync',
  },
  SHOW_MAP: {
    method: 'mapModule-showMap',
    call: 'sync',
  },
  HIDE_MAP: {
    method: 'mapModule-hideMap',
    call: 'sync',
  },
  UPDATE_HEADER_OPTIONS_AND_SHOW_MAP: (title, text) => {
    return {
      method: 'mapModule-updateHeaderOptionsAndShowMap',
      params: {
        title,
        rightButtons: [
          {
            text,
            callbackName: 'contactUs',
          },
        ],
      },
      call: 'sync',
    };
  },
  UPDATE_RIDER_POSITION: (lat, lng) => {
    return {
      method: 'mapModule-updateRiderPosition',
      params: {
        lat: lat,
        lng: lng,
      },
      call: 'sync',
    };
  },
  UPDATE_HOME_POSITION: (deliveryLat, deliveryLng) => {
    return {
      method: 'mapModule-updateHomePosition',
      params: {
        lat: deliveryLat,
        lng: deliveryLng,
      },
      call: 'sync',
    };
  },
  UPDATE_STORE_POSITION: (storeLat, storeLng) => {
    return {
      method: 'mapModule-updateStorePosition',
      params: {
        lat: storeLat,
        lng: storeLng,
      },
      call: 'sync',
    };
  },
  FOCUS_POSITIONS: focusPositionList => {
    return {
      method: 'mapModule-focusPositions',
      params: {
        positions: focusPositionList,
      },
      call: 'sync',
    };
  },
  NATIVE_LAYOUT: (area, data) => {
    return {
      method: 'nativeLayoutModule-nativeJsConfigLayout',
      params: {
        area: area,
        data: data,
      },
      call: 'sync',
    };
  },
};

const dsRegReceiveTokenListener = ({ callback }) => {
  dsbridge.registerAsyn('onReceiveToken', res => {
    callback && typeof callback === 'function' && callback(res);
  });
};

const hasNativeSavedAddress = () => {
  if (Utils.isWebview() && sessionStorage.getItem('addressIdFromNative')) {
    return true;
  } else {
    return false;
  }
};

const getTokenFromNative = user => {
  const { isExpired } = user || {};
  if (isExpired) {
    dsbridgeCall(NATIVE_METHODS.TOKEN_EXPIRED);
  } else {
    dsbridgeCall(NATIVE_METHODS.GET_TOKEN);
  }
};

const dsbridgeCall = nativeMethod => {
  const { method, params, call } = nativeMethod || {};
  const { data: hasNativeMethod } = JSON.parse(
    dsbridge.call('callNative', { method: 'hasNativeMethod', params: { methodName: method } })
  );
  if (hasNativeMethod && call === 'sync') {
    let result = dsbridge.call('callNative', { method, params });
    let { code, data, message } = JSON.parse(result);
    if (typeof data === 'undefined' || data === null) {
      return;
    }
    try {
      return data;
    } catch (e) {
      console.log(e);
    }
  } else if (hasNativeMethod && call === 'async') {
    var promise = new Promise(function(resolve, reject) {
      dsbridge.call('callNativeAsync', { method, params }, function(result) {
        let { code, data, message } = JSON.parse(result);
        try {
          resolve(data);
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
    });
    return promise;
  } else {
    throw new Error("Native side didn't have method: " + method);
  }
};

export default {
  dsbridgeCall,
  dsRegReceiveTokenListener,
  hasNativeSavedAddress,
  getTokenFromNative,
};
