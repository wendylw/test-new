import Utils from './utils';
import config from '../config';

export const pushEvent = (eventName, attributes) => {
  try {
    if (Utils.isWebview()) {
      if (Utils.isIOSWebview()) {
        window.webkit?.messageHandlers?.clevertap?.postMessage({
          action: 'recordEventWithProps',
          event: eventName,
          props: {
            ...attributes,
            businessName: Utils.isSiteApp() ? 'beepit.com' : config.business,
          },
        });
      }

      if (Utils.isAndroidWebview()) {
        window.CleverTap?.pushEvent(
          eventName,
          JSON.stringify({
            ...attributes,
            businessName: Utils.isSiteApp() ? 'beepit.com' : config.business,
          })
        );
      }
    } else {
      window.clevertap?.event.push(eventName, {
        ...attributes,
        businessName: Utils.isSiteApp() ? 'beepit.com' : config.business,
      });
    }
  } catch (error) {
    console.error('CleverTap encountered with error:');
    console.error(error);
  }
};
