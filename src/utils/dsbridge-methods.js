import Utils from './utils';
import dsbridge from 'dsbridge';

export const nativeMethods = {
  gotoHome: {
    name: 'gotoHome',
  },
  getAddress: {
    name: 'getAddress',
  },
  getLoginStatus: {
    name: 'isLogin',
  },
  getToken: {
    name: 'getToken',
  },
  tokenExpired: {
    name: 'tokenExpired',
  },
  closeMap: {
    name: 'closeMap',
  },
  updateHeaderOptionsAndShowMap: (title, text) => {
    return {
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
  updateStorePosition: (storeLat, storeLng) => {
    return {
      name: 'updateStorePosition',
      params: {
        lat: storeLat,
        lng: storeLng,
      },
    };
  },
  updateHomePosition: (deliveryLat, deliveryLng) => {
    return {
      name: 'updateHomePosition',
      params: {
        lat: deliveryLat,
        lng: deliveryLng,
      },
    };
  },
  updateRiderPosition: (lat, lng) => {
    return {
      name: 'updateRiderPosition',
      params: {
        lat: lat,
        lng: lng,
      },
    };
  },
  focusPositions: focusPositionList => {
    return {
      name: 'focusPositions',
      params: {
        positions: focusPositionList,
      },
    };
  },
  startChat: (phone, name, email, message) => {
    return {
      name: 'startChat',
      params: {
        phoneNumber: phone,
        name,
        email,
        message,
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
    DsbridgeContainer.dsbridgeCall(nativeMethods.tokenExpired);
  } else {
    DsbridgeContainer.dsbridgeCall(nativeMethods.getToken);
  }
};

const dsbridgeCall = method => {
  const { name, params } = method || {};
  if (dsbridge.hasNativeMethod(name, 'syn')) {
    let result = dsbridge.call(name, params);
    if (typeof result === 'undefined' || result === null) {
      return;
    }
    try {
      return JSON.parse(result);
    } catch (e) {
      console.log(e);
    }
  } else if (dsbridge.hasNativeMethod(name, 'asyn')) {
    var promise = new Promise(function(resolve, reject) {
      dsbridge.call(name, params, function(result) {
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
