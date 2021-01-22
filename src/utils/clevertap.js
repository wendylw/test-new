import Utils from './utils';
import config from '../config';

const businessName = Utils.isSiteApp() ? 'beepit.com' : config.business;

export const pushEvent = (eventName, attributes) => {
  try {
    if (Utils.isWebview()) {
      if (Utils.isIOSWebview()) {
        window.webkit?.messageHandlers?.clevertap?.postMessage({
          action: 'recordEventWithProps',
          event: eventName,
          props: {
            ...attributes,
            businessName,
          },
        });
      }

      if (Utils.isAndroidWebview()) {
        window.CleverTap?.pushEvent(
          eventName,
          JSON.stringify({
            ...attributes,
            businessName,
          })
        );
      }
    } else {
      window.clevertap?.event.push(eventName, {
        ...attributes,
        businessName,
      });
    }
  } catch (error) {
    console.error('CleverTap encountered with error:');
    console.error(error);
  }
};

export const onUserLogin = userProfileProps => {
  try {
    if (!Utils.isWebview()) {
      window.clevertap?.onUserLogin.push({
        Site: {
          ...userProfileProps,
        },
      });
    }
  } catch (error) {
    console.error('CleverTap encountered with error:');
    console.error(error);
  }
};
