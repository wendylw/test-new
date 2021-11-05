import Utils from '../utils/utils';
import Constants from '../utils/constants';

export const isFromQROrderThankYouPage = pathname => {
  const { ROUTER_PATHS } = Constants;
  return pathname === ROUTER_PATHS.THANK_YOU && Utils.isQROrder();
};
