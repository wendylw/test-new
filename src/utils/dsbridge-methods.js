import Utils from './utils';
import dsbridge from 'dsbridge';

export const NATIVE_METHODS = {
  START_CHAT: (phone, name, email, message) => {
    return {
      module: 'beepModule',
      name: 'startChat',
      params: {
        phoneNumber: phone,
        name,
        email,
        message,
      },
    };
  },
  GET_ADDRESS: {
    module: 'beepModule',
    name: 'getAddress',
  },
  GOTO_HOME: {
    module: 'routerModule',
    name: 'gotoHome',
  },
  GET_LOGIN_STATUS: {
    module: 'userModule',
    name: 'isLogin',
  },
  GET_TOKEN: {
    module: 'userModule',
    name: 'getToken',
  },
  TOKEN_EXPIRED: {
    module: 'userModule',
    name: 'tokenExpired',
  },
  SHOW_MAP: {
    module: 'mapModule',
    name: 'showMap',
  },
  HIDE_MAP: {
    module: 'mapModule',
    name: 'hideMap',
  },
  UPDATE_HEADER_OPTIONS_AND_SHOW_MAP: (title, text) => {
    return {
      module: 'mapModule',
      name: 'updateHeaderOptionsAndShowMap',
      params: {
        title,
        rightButtons: [
          {
            text,
            callbackName: 'contactUs',
          },
        ],
      },
    };
  },
  UPDATE_RIDER_POSITION: (lat, lng) => {
    return {
      module: 'mapModule',
      name: 'updateRiderPosition',
      params: {
        lat: lat,
        lng: lng,
      },
    };
  },
  UPDATE_HOME_POSITION: (deliveryLat, deliveryLng) => {
    return {
      module: 'mapModule',
      name: 'updateHomePosition',
      params: {
        lat: deliveryLat,
        lng: deliveryLng,
      },
    };
  },
  UPDATE_STORE_POSITION: (storeLat, storeLng) => {
    return {
      module: 'mapModule',
      name: 'updateStorePosition',
      params: {
        lat: storeLat,
        lng: storeLng,
      },
    };
  },
  FOCUS_POSITIONS: focusPositionList => {
    return {
      module: 'mapModule',
      name: 'focusPositions',
      params: {
        positions: focusPositionList,
      },
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

const dsbridgeCall = method => {
  const { module, name, params } = method || {};
  if (dsbridge.hasNativeMethod(`${module}.${name}`, 'syn')) {
    let result = dsbridge.call(`${module}.${name}`, params);
    if (typeof result === 'undefined' || result === null) {
      return;
    }
    try {
      return JSON.parse(result);
    } catch (e) {
      console.log(e);
    }
  } else if (dsbridge.hasNativeMethod(`${module}.${name}`, 'asyn')) {
    var promise = new Promise(function(resolve, reject) {
      dsbridge.call(`${module}.${name}`, params, function(result) {
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
    throw new Error("Native side didn't have method: " + name);
  }
};

export default {
  dsbridgeCall,
  dsRegReceiveTokenListener,
  hasNativeSavedAddress,
  getTokenFromNative,
};
