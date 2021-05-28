import dsBridge from 'dsbridge';
import { NativeMethods } from './dsbridge-methods';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  let config = {
    left: left ? [left] : [],
    center: center ? [center] : [],
    right: right ? [right] : [],
  };
  NativeMethods.nativeLayout('header', config);
};

export const updateNativeHeaderToDefault = () => {
  NativeMethods.nativeLayout('header', null);
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
