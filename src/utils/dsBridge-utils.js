import dsBridge from 'dsbridge';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import { NativeMethods } from './dsbridge-methods';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  const config = {
    left: left ? [left] : [],
    center: center ? [center] : [],
    right: right ? [right] : [],
  };
  NativeMethods.nativeLayout('header', config);
};

export const updateNativeHeaderToDefault = () => {
  NativeMethods.nativeLayout('header', null);
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
