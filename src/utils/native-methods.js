import dsBridge from 'dsbridge';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isArray from 'lodash/isArray';
import logger from './monitoring/logger';
import debug from './debug';
import Utils from './utils';

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

export const BEEP_MODULE_METHODS = {
  SET_ADDRESS: 'beepModule-setAddress',
  SHARE_LINK: 'beepModule-shareLink',
  HAS_SAVE_FAVORITE_STORE_SUPPORT: 'beepModule-hasSaveFavoriteStoreSupport',
  OPEN_BROWSER_URL: 'beepModule-openBrowserURL',
};

export class NativeAPIError extends Error {
  constructor(message, code = NATIVE_API_ERROR_CODES.UNKNOWN_ERROR, extra) {
    super(message);
    this.code = code;
    this.extra = extra;
  }

  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      extra: this.extra,
    };
  }
}

const dsBridgeSyncCall = (method, params) => {
  try {
    const result = dsBridge.call('callNative', { method, params });

    debug('NativeMethod: %s\nparams: %o\nresult: %s\n', method, params, result);

    const { code, data, message } = JSON.parse(result);

    if (code !== NATIVE_API_ERROR_CODES.SUCCESS) {
      throw new NativeAPIError(message, code, data);
    }

    logger.log('Utils_DSBridge_CallAPISucceeded', {
      method,
    });

    return data;
  } catch (error) {
    const errorData = error instanceof NativeAPIError ? error.toJSON() : { message: error.message || error.toString() };

    logger.error('Utils_DSBridge_CallAPIFailed', {
      method,
      ...errorData,
    });

    throw error;
  }
};

const dsBridgeAsyncCall = (method, params) =>
  new Promise((resolve, reject) => {
    try {
      debug('Start NativeMethod: %s\nparams: %o\n', method, params);

      dsBridge.call('callNativeAsync', { method, params }, result => {
        const { code, data, message } = JSON.parse(result);

        debug('NativeMethod: %s\nparams: %o\nresult: %s\n', method, params, result);

        if (code !== NATIVE_API_ERROR_CODES.SUCCESS) {
          reject(new NativeAPIError(message, code, data));
          return;
        }

        logger.log('Utils_DSBridge_CallAPISucceeded', {
          method,
        });

        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  }).catch(error => {
    const errorData = error instanceof NativeAPIError ? error.toJSON() : { message: error.message || error.toString() };

    logger.error('Utils_DSBridge_CallAPIFailed', {
      method,
      ...errorData,
    });

    throw error;
  });

const NATIVE_METHOD_SUPPORT_MAP = {};

export const hasMethodInNative = method => {
  try {
    const isInMap = Object.prototype.hasOwnProperty.call(NATIVE_METHOD_SUPPORT_MAP, method);

    if (!isInMap) {
      NATIVE_METHOD_SUPPORT_MAP[method] = dsBridgeSyncCall('hasNativeMethod', {
        methodName: method,
      });
    }
    // The return value of hasMethodInNative maybe 'false' or 'true'
    return JSON.parse(NATIVE_METHOD_SUPPORT_MAP[method]);
  } catch (error) {
    return false;
  }
};

const NATIVE_ICON_RES_SUPPORT_MAP = {};

export const hasIconResInNative = iconRes => {
  try {
    const isInMap = Object.prototype.hasOwnProperty.call(NATIVE_ICON_RES_SUPPORT_MAP, iconRes);

    if (!isInMap) {
      NATIVE_METHOD_SUPPORT_MAP[iconRes] = dsBridgeSyncCall('nativeLayoutModule-hasNativeIconRes', {
        iconRes,
      });
    }
    return NATIVE_METHOD_SUPPORT_MAP[iconRes];
  } catch (error) {
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

export const getWebviewSource = () => window.webViewSource;

export const startChat = ({ orderId, storeName, source }) => {
  const data = {
    method: 'beepModule-startChat',
    params: {
      orderId,
      storeName,
      source,
    },
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const shareLink = ({ link, title }) => {
  const data = {
    method: BEEP_MODULE_METHODS.SHARE_LINK,
    params: {
      link,
      title,
    },
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const hasSaveFavoriteStoreSupport = () => {
  const data = {
    method: BEEP_MODULE_METHODS.HAS_SAVE_FAVORITE_STORE_SUPPORT,
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const getAddress = () => {
  const data = {
    method: 'beepModule-getAddress',
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const setAddress = addressInfo => {
  const shortName = _get(addressInfo, 'shortName', '');
  const fullName = _get(addressInfo, 'fullName', '');
  const lat = _get(addressInfo, 'coords.lat', 0) || 0;
  const lng = _get(addressInfo, 'coords.lng', 0) || 0;
  const city = _get(addressInfo, 'city', '');
  const postCode = _get(addressInfo, 'postCode', '');
  const countryCode = _get(addressInfo, 'countryCode', '');
  const savedAddressId = _get(addressInfo, 'savedAddressId', '');

  const data = {
    method: BEEP_MODULE_METHODS.SET_ADDRESS,
    params: {
      address: fullName,
      addressName: shortName,
      lat,
      lng,
      countryCode,
      savedAddressId,
      postCode,
      city,
    },
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const BROWSER_TYPES = {
  CHROME: 'chrome',
  DEFAULT: 'default',
};

export const openBrowserURL = ({ url, type = BROWSER_TYPES.DEFAULT }) => {
  const data = {
    method: BEEP_MODULE_METHODS.OPEN_BROWSER_URL,
    params: {
      url,
      type,
    },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const closeWebView = () => {
  const data = {
    method: 'routerModule-closeWebView',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const goBack = () => {
  const data = {
    method: 'routerModule-back',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const getLoginStatus = () => {
  const data = {
    method: 'userModule-isLogin',
    mode: MODE.SYNC,
  };
  // IOS return string value, android return boolean value,so it needs to compatible at this time
  return JSON.parse(dsBridgeCall(data));
};

export const getTokenAsync = () => {
  const data = {
    method: 'userModule-getToken',
    params: {
      touchPoint: Utils.getRegistrationTouchPoint(),
    },
    mode: MODE.ASYNC,
  };
  return dsBridgeCall(data);
};

export const tokenExpiredAsync = () => {
  const data = {
    method: 'userModule-tokenExpired',
    params: {
      touchPoint: Utils.getRegistrationTouchPoint(),
    },
    mode: MODE.ASYNC,
  };
  return dsBridgeCall(data);
};

export const showMap = () => {
  const data = {
    method: 'mapModule-showMap',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const hideMap = () => {
  const data = {
    method: 'mapModule-hideMap',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const updateRiderPosition = (lat, lng) => {
  const data = {
    method: 'mapModule-updateRiderPosition',
    params: {
      lat,
      lng,
    },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const updateHomePosition = (lat, lng) => {
  const data = {
    method: 'mapModule-updateHomePosition',
    params: {
      lat,
      lng,
    },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const updateStorePosition = (lat, lng) => {
  const data = {
    method: 'mapModule-updateStorePosition',
    params: {
      lat,
      lng,
    },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const focusPositions = focusPositionList => {
  const data = {
    method: 'mapModule-focusPositions',
    // TODO: Hot fix live map wouldn't display on Android
    params: Utils.isAndroidWebview()
      ? focusPositionList
      : {
          positions: focusPositionList,
        },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const nativeLayout = (area, config) => {
  const data = {
    method: 'nativeLayoutModule-nativeJsConfigLayout',
    params: {
      area,
      data: config,
    },
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const showCompleteProfilePageAsync = params => {
  const { hideSkipButton = false } = params || {};
  const data = {
    method: 'routerModule-showCompleteProfilePage',
    mode: MODE.ASYNC,
    params: { hideSkipButton },
  };
  return dsBridgeCall(data);
};

export const gotoHome = () => {
  const data = {
    method: 'routerModule-gotoHome',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const getUserInfo = () => {
  const data = {
    method: 'userModule-getUserInfo',
    mode: MODE.SYNC,
  };
  return dsBridgeCall(data);
};

export const promptEnableAppNotification = ({ title, description, sourcePage }) => {
  const data = {
    method: 'beepModule-promptEnableAppNotification',
    params: {
      title,
      description,
      sourcePage,
    },
    mode: MODE.SYNC,
  };

  return dsBridgeCall(data);
};

export const isLiveChatAvailable = () => window.liveChatAvailable;

export const updateNativeHeader = ({ left, center, right, headerBackgroundColor } = {}) => {
  const transformToArray = data => (_isArray(data) ? data : data ? [data] : []);
  const config = {
    left: transformToArray(left),
    center: transformToArray(center),
    right: transformToArray(right),
    headerBackgroundColor,
  };
  nativeLayout('header', config);
};

export const updateNativeHeaderToDefault = () => {
  nativeLayout('header', null);
};

export const registerNativeHeaderEvents = (params, events) => {
  if (!params || params.area !== 'header') {
    return;
  }

  const event = _find(events, { type: params.event, targetId: params.id });
  const handler = _get(event, 'handler', null);

  if (_isFunction(handler)) {
    handler.call(null, params.data);
  }
};

export const dispatchNativeEvent = (method, params, data) => {
  switch (method) {
    case 'nativeLayoutModule_jsNativeEventDispatch':
      registerNativeHeaderEvents(params, data);
      break;
    default:
  }
};

export const registerFunc = data => {
  dsBridge.register('callWebView', res => {
    const { method, params } = JSON.parse(res);
    dispatchNativeEvent(method, params, data);
    return { code: '00000' };
  });
};
