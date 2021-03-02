import dsbridge from 'dsbridge';
import _get from 'lodash/get';

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
            callbackkName: 'contactUs',
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

export const registeredMethods = {
  onReceiveToken: event => {
    const handler = _get(event, 'handler', null);
    return {
      name: 'onReceiveToken',
      callback: handler,
    };
  },
};

const DsbridgeContainer = {
  callMethodFromNative: method => {
    try {
      const res = dsbridge.call(method.name, method.params);
      return res;
    } catch (error) {
      console.log(error);
    }
  },

  registerMethodToNative: ({ name, callback }) => {
    dsbridge.registerAsyn(name, res => {
      callback && typeof callback === 'function' && callback(res);
    });
  },
};

export default DsbridgeContainer;
