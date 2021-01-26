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
            'account name': businessName,
          },
        });
      }

      if (Utils.isAndroidWebview()) {
        window.CleverTap?.pushEvent(
          eventName,
          JSON.stringify({
            ...attributes,
            'account name': businessName,
          })
        );
      }
    } else {
      window.clevertap?.event.push(eventName, {
        ...attributes,
        'account name': businessName,
      });
    }
  } catch (error) {
    console.warn('CleverTap encountered with error:');
    console.warn(error);
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
    console.warn('CleverTap encountered with error:');
    console.warn(error);
  }
};
