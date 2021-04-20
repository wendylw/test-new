import Utils from './utils';
import dsbridge from 'dsbridge';

export const NATIVE_METHODS = {
  START_CHAT: (phone, name, email, message) => {
    return {
      method: 'beep_module-start_chat',
      data: {
        phoneNumber: phone,
        name,
        email,
        message,
      },
      call: 'sync',
    };
  },
  GET_ADDRESS: {
    method: 'beep_module-get_address',
    call: 'sync',
  },
  GOTO_HOME: {
    method: 'router_module-close_webview',
    call: 'sync',
  },
  GET_LOGIN_STATUS: {
    method: 'user_module-is_login',
    call: 'sync',
  },
  GET_TOKEN: {
    method: 'user_module-get_token',
    call: 'async',
  },
  TOKEN_EXPIRED: {
    method: 'user_module-token_expired',
    call: 'sync',
  },
  SHOW_MAP: {
    method: 'map_module-show_map',
    call: 'sync',
  },
  HIDE_MAP: {
    method: 'map_module-hide_map',
    call: 'sync',
  },
  UPDATE_HEADER_OPTIONS_AND_SHOW_MAP: (title, text) => {
    return {
      method: 'map_module-update_header_options_and_show_map',
      data: {
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
      method: 'map_module-update_rider_position',
      data: {
        lat: lat,
        lng: lng,
      },
      call: 'sync',
    };
  },
  UPDATE_HOME_POSITION: (deliveryLat, deliveryLng) => {
    return {
      method: 'map_module-update_home_position',
      data: {
        lat: deliveryLat,
        lng: deliveryLng,
      },
      call: 'sync',
    };
  },
  UPDATE_STORE_POSITION: (storeLat, storeLng) => {
    return {
      method: 'map_module-update_store_position',
      data: {
        lat: storeLat,
        lng: storeLng,
      },
      call: 'sync',
    };
  },
  FOCUS_POSITIONS: focusPositionList => {
    return {
      method: 'map_module-focus_positions',
      data: {
        positions: focusPositionList,
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
  const { method, data, call } = nativeMethod || {};
  const { data: hasNativeMethod } = JSON.parse(
    dsbridge.call('callNative', { method: 'beep_module-has_native_method', data: method })
  );
  if (hasNativeMethod && call === 'sync') {
    let result = dsbridge.call('callNative', { method, data });
    if (typeof result === 'undefined' || result === null) {
      return;
    }
    try {
      return JSON.parse(result);
    } catch (e) {
      console.log(e);
    }
  } else if (hasNativeMethod && call === 'async') {
    var promise = new Promise(function(resolve, reject) {
      dsbridge.call('callNativeAsync', { method, data }, function(result) {
        try {
          resolve(JSON.parse(result));
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
