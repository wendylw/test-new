import dsBridge from 'dsbridge';

// https://storehub.atlassian.net/wiki/spaces/TS/pages/1049886771/Specification+for+dsBridge+usage
export const updateNativeHeader = ({ left, center, right } = {}) => {
  alert('native_layout.nativeJSConfigLayout called');

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
    jsNativeEventDispatch: function(data) {
      alert(JSON.stringify(data));
    },
  });
};

export const registerNativeHeaderEvent = (eventName, func) => {
  dsBridge.register(eventName, func);
};
