import _isEmpty from 'lodash/isEmpty';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import i18next from 'i18next';

const { PROMOTION_ERROR_CODES, VOUCHER_STATUS, CLIENTS } = Constants;

export function getErrorMessageByPromoErrorCode(code, extraInfo, errorMessage, onlineStoreInfo) {
  if (PROMOTION_ERROR_CODES[code]) {
    const translationKey = `OrderingPromotion:${PROMOTION_ERROR_CODES[code].desc}`;

    if (code === '54416') {
      const { supportedChannel } = extraInfo || {};
      return i18next.t(translationKey, { supportedChannel });
    }

    // not match min subtotal
    if (code === '54417') {
      const { minSubtotalConsumingPromo } = extraInfo || {};
      const { locale, currency, country } = onlineStoreInfo;
      const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');
      let minSubtotal = !(locale && currency)
        ? minSubtotalConsumingPromo
        : Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(minSubtotalConsumingPromo));

      if (country === 'MY' && isSafari) {
        minSubtotal = minSubtotal.replace(/^(\D+)/, '$1 ');
      }

      return i18next.t(translationKey, { minSubtotalConsumingPromo: minSubtotal });
    }

    // not match the client type
    if (code === '54418') {
      const supportClient = Utils.getHeaderClient() === CLIENTS.WEB ? 'Beep app' : 'Web';
      return i18next.t(translationKey, { supportClient });
    }

    return i18next.t(translationKey);
  } else {
    return _isEmpty(errorMessage) ? i18next.t(`OrderingPromotion:60000InvalidPromotionOrVoucher`) : errorMessage;
  }
}

export const getPromoStatusLabelText = ({ status, validFrom, validTo, expired, invalidForWeb }) => {
  // Voucher status list: ['expired', 'redeemed', 'pendingRedeem', 'unused']
  if (status === VOUCHER_STATUS.EXPIRED) {
    return i18next.t('OrderingPromotion:PromoExpiredLabel');
  }

  if (status === VOUCHER_STATUS.REDEEMED) {
    return i18next.t('OrderingPromotion:PromoRedeemedLabel');
  }

  if (expired) {
    return i18next.t('OrderingPromotion:PromoExpiredLabel');
  }

  const currentDate = new Date();

  if (currentDate < new Date(validFrom) || currentDate > new Date(validTo)) {
    return i18next.t('OrderingPromotion:PromoInvalidLabel');
  }

  if (invalidForWeb) {
    return i18next.t('OrderingPromotion:PromoAppOnlyLabel');
  }

  return '';
};
