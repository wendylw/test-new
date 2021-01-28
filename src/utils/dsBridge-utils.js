import dsBridge from 'dsbridge';

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
    jsNativeEventDispatch: function(params) {
      alert(JSON.stringify(params));

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
