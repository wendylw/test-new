import _isNil from 'lodash/isNil';
import Utils from './utils';

export const pushEvent = (eventName, attributes) => {
  if (Utils.isWebview()) {
    if (Utils.isIOSWebview()) {
      if (_isNil(attributes)) {
        window.webkit?.messageHandlers?.clevertap?.postMessage({
          action: 'recordEvent',
          event: eventName,
        });
      } else {
        window.webkit?.messageHandlers?.clevertap?.postMessage({
          action: 'recordEventWithProps',
          event: eventName,
          props: attributes,
        });
      }
    }

    if (Utils.isAndroidWebview()) {
      if (_isNil(attributes)) {
        window.CleverTap?.pushEvent(eventName);
      } else {
        window.CleverTap?.pushEvent(eventName, JSON.stringify(attributes));
      }
    }
  } else {
    if (_isNil(attributes)) {
      window.clevertap?.event.push(eventName);
    } else {
      window.clevertap?.event.push(eventName, attributes);
    }
  }
};
