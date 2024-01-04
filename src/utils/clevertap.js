/* eslint-disable no-console */
import Utils from './utils';
import config from '../config';
import debug from './debug';

const businessName = Utils.isSiteApp() ? 'beepit.com' : config.business;

const pushEvent = (eventName, attributes) => {
  try {
    debug('[CleverTap]\nEvent: %s\nAttributes: %o', eventName, attributes);

    if (Utils.isWebview()) {
      if (Utils.isIOSWebview()) {
        if (eventName === 'Charged') {
          const { Items: items, ...chargeDetails } = attributes || {};

          window.webkit?.messageHandlers?.clevertap?.postMessage({
            action: 'recordChargedEvent',
            chargeDetails: {
              ...chargeDetails,
              'account name': businessName,
              Source: 'Mobile',
            },
            items,
          });
        } else {
          window.webkit?.messageHandlers?.clevertap?.postMessage({
            action: 'recordEventWithProps',
            event: eventName,
            props: {
              ...attributes,
              'account name': businessName,
              Source: 'Mobile',
            },
          });
        }
      }

      if (Utils.isAndroidWebview()) {
        if (eventName === 'Charged') {
          const { Items, ...chargeDetails } = attributes || {};

          window.CleverTap?.pushChargedEvent(
            JSON.stringify({
              ...chargeDetails,
              'account name': businessName,
              Source: 'Mobile',
            }),
            JSON.stringify(Items)
          );
        } else {
          window.CleverTap?.pushEvent(
            eventName,
            JSON.stringify({
              ...attributes,
              'account name': businessName,
              Source: 'Mobile',
            })
          );
        }
      }
    } else {
      window.clevertap?.event.push(eventName, {
        ...attributes,
        'account name': businessName,
        Source: Utils.isTNGMiniProgram() ? 'TNG Mini Program' : 'Web',
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
      debug('[CleverTap]\nEvent: %s\nAttributes: %o', 'onUserLogin', userProfileProps);

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
