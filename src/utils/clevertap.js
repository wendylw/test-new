import Utils from './utils';
import config from '../config';

const businessName = Utils.isSiteApp() ? 'beepit.com' : config.business;

const pushEvent = (eventName, attributes) => {
  try {
    if (Utils.isWebview()) {
      const appVersion = window.beepAppVersion;

      if (Utils.isIOSWebview()) {
        if (eventName === 'Charged' && appVersion >= '1.7.3') {
          const { Items: items, ...chargeDetails } = attributes || {};

          window.webkit?.messageHandlers?.clevertap?.postMessage({
            action: 'recordChargedEvent',
            chargeDetails: {
              ...chargeDetails,
              'account name': businessName,
            },
            items: items,
          });
        } else {
          window.webkit?.messageHandlers?.clevertap?.postMessage({
            action: 'recordEventWithProps',
            event: eventName,
            props: {
              ...attributes,
              'account name': businessName,
            },
          });
        }
      }

      if (Utils.isAndroidWebview()) {
        if (eventName === 'Charged' && appVersion >= '1.7.3') {
          const { Items, ...chargeDetails } = attributes || {};

          window.CleverTap?.pushChargedEvent(
            JSON.stringify({
              ...chargeDetails,
              'account name': businessName,
            }),
            JSON.stringify(Items)
          );
        } else {
          window.CleverTap?.pushEvent(
            eventName,
            JSON.stringify({
              ...attributes,
              'account name': businessName,
            })
          );
        }
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

const onUserLogin = userProfileProps => {
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

export default {
  pushEvent,
  onUserLogin,
};
