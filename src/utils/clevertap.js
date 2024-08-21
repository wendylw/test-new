/* eslint-disable no-console */
import Utils from './utils';
import { isTNGMiniProgram, isGCashMiniProgram } from '../common/utils';
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
              'account name': businessName,
              Source: 'Mobile',
              ...attributes,
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
              'account name': businessName,
              Source: 'Mobile',
              ...attributes,
            })
          );
        }
      }
    } else {
      let source = 'Web';

      if (isTNGMiniProgram()) {
        source = 'TNG Mini Program';
      } else if (isGCashMiniProgram()) {
        source = 'GCash Mini Program';
      }

      window.clevertap?.event.push(eventName, {
        'account name': businessName,
        Source: source,
        ...attributes,
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
