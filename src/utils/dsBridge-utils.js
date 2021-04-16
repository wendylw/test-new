import dsBridge from 'dsbridge';
import Utils from './utils';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  dsBridge.call('native_layout.nativeJSConfigLayout', [
    {
      area: 'header',
      data: {
        left: left ? [left] : [],
        center: center ? [center] : [],
        right: right ? [right] : [],
      },
    },
  ]);
};

export const updateNativeHeaderToDefault = () => {
  dsBridge.call('native_layout.nativeJSConfigLayout', [
    {
      area: 'header',
      data: null,
    },
  ]);
};

export const registerNativeHeaderEvents = events => {
  dsBridge.register('native_layout', {
    tag: 'native_layout',
    jsNativeEventDispatch: function(jsonEncodeParams) {
      const params = JSON.parse(jsonEncodeParams);
      if (!params || params.area !== 'header') {
        return;
      }

      const event = _find(events, { type: params.event, targetId: params.id });
      const handler = _get(event, 'handler', null);

      if (_isFunction(handler)) {
        handler.call(null, params.data);
      }
    },
  });
};

// export const startLiveChat = ({ orderId, name, phone, email, storeName }) => {
//   const message = `Order number: ${orderId}\nStore Name: ${storeName}`;
//   // TODO: will update to use dsBridge in the future
//   if (Utils.isAndroidWebview()) {
//     window.androidInterface.startChat(
//       JSON.stringify({
//         phoneNumber: phone,
//         name,
//         email,
//         message,
//       })
//     );
//   }

//   if (Utils.isIOSWebview()) {
//     window.webkit.messageHandlers.shareAction.postMessage({
//       functionName: 'startChat',
//       phoneNumber: phone,
//       name,
//       email,
//       message,
//     });
//   }
// };

export const startLiveChat = ({ orderId, name, phone, email, storeName }) => {
  const message = `Order number: ${orderId}\nStore Name: ${storeName}`;
  dsBridge.call('callNative', {
    function: 'beep_module_start_chat',
    data: { phoneNumber: phone, name, email, message },
  });
};

export const goBack = () => {
  // TODO: will update to use dsBridge in the future
  if (Utils.isAndroidWebview()) {
    window.androidInterface.dispatchGoBack();
  }

  if (Utils.isIOSWebview()) {
    dsBridge.call('beep.back');
  }
};

export const gotoHome = () => {
  if (Utils.isIOSWebview()) {
    dsBridge.call('beep.gotohome');
  }
};
