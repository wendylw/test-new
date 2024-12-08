import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import { PAYMENT_TYPE } from './constants';

const { PAYMENT_PROVIDERS, CLIENTS } = Constants;

export const getPaymentType = paymentProvider => {
  if (paymentProvider === PAYMENT_PROVIDERS.TNG_ONLINE) {
    const client = Utils.judgeClient();
    let paymentType;
    switch (client) {
      case CLIENTS.IOS:
      case CLIENTS.MAC:
        // Beep iOS app and browser use deep links
        // iPad could use Mac OS as a user agent, therefore should take MAC agent into consideration.
        paymentType = PAYMENT_TYPE.APP;
        break;
      case CLIENTS.ANDROID:
        // Beep Android app uses deep link while Android browser use webpage
        paymentType = Utils.isAndroidWebview() ? PAYMENT_TYPE.APP : PAYMENT_TYPE.WEB;
        break;
      default:
        // Otherwise, use webpage only
        paymentType = PAYMENT_TYPE.WEB;
        break;
    }
    return paymentType;
  }

  // For other payment providers, we ONLY return undefined
  return undefined;
};
