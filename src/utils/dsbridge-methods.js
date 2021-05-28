import dsbridge from 'dsbridge';

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
      if (code === 'A0400' || code === 'C0113' || code === 'B0001') {
        console.error(message);
      } else if (code === '00000') {
        return data;
      }
    } catch (e) {
      console.log(e);
    }
  } else if (mode === 'async') {
    var promise = new Promise(function(resolve, reject) {
      try {
        dsbridge.call('callNativeAsync', { method, params }, function(result) {
          let { code, data, message } = JSON.parse(result);
          if (code === 'A0400' || code === 'C0113' || code === 'B0001') {
            reject(new Error(message));
          } else if (code === '00000') {
            resolve(data);
          }
        });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
    return promise;
  }
};
