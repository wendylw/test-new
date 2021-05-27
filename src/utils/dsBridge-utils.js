import dsBridge from 'dsbridge';
import DsbridgeUtils, { NATIVE_METHODS } from './dsbridge-methods';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  let data = {
    left: left ? [left] : [],
    center: center ? [center] : [],
    right: right ? [right] : [],
  };
  DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.NATIVE_LAYOUT('header', data));
};

export const updateNativeHeaderToDefault = () => {
  DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.NATIVE_LAYOUT('header', null));
};

export const registerFunc = data => {
  dsBridge.register('callWebView', function(res) {
    const { method, params } = JSON.parse(res);
    dispatchNativeEvent(method, params, data);
    return { code: '00000' };
  });
};

export const dispatchNativeEvent = (method, params, data) => {
  switch (method) {
    case 'nativeLayoutModule_jsNativeEventDispatch':
      registerNativeHeaderEvents(params, data);
      break;
    default:
      return;
  }
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

export const getTokenFromNative = async user => {
  const { isExpired } = user || {};
  if (isExpired) {
    return await DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.TOKEN_EXPIRED);
  } else {
    return await DsbridgeUtils.dsbridgeCall(NATIVE_METHODS.GET_TOKEN);
  }
};
