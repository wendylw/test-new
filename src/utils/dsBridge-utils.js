import dsBridge from 'dsbridge';
import Utils from './utils';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  const handlers = {};

  [left, center, right].forEach(item => {
    if (item && item.eventHandlers) {
      item.events = Object.keys(item.eventHandlers);
      for (let event in item.eventHandlers) {
        handlers[item.id + event] = item.eventHandlers[event];
      }

      delete item.eventHandlers;
    }
  });

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

  dsBridge.register('native_layout', {
    tag: 'native_layout',
    jsNativeEventDispatch: function(jsonEncodeParams) {
      const params = JSON.parse(jsonEncodeParams);

      if (params && params.area === 'header') {
        const handler = handlers[params.id + params.event];

        if (typeof handler === 'function') {
          handler.call(null, params.data);
        }
      }
    },
  });
};

export const registerNativeHeaderEvent = (eventName, func) => {
  dsBridge.register(eventName, func);
};

export const startLiveChat = ({ orderId, name, phone, email, storeName }) => {
  const message = `Order number: ${orderId}\nStore Name: ${storeName}`;
  // TODO: will update to use dsBridge in the future
  if (Utils.isAndroidWebview()) {
    window.androidInterface.startChat(
      JSON.stringify({
        phoneNumber: phone,
        name,
        email,
        message,
      })
    );
  }

  if (Utils.isIOSWebview()) {
    window.webkit.messageHandlers.shareAction.postMessage({
      functionName: 'startChat',
      phoneNumber: phone,
      name,
      email,
      message,
    });
  }
};
