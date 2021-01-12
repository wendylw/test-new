import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import i18next from 'i18next';

const { PROMOTION_ERROR_CODES, VOUCHER_STATUS } = Constants;

export function getErrorMessageByPromoErrorCode(code, extraInfo, onlineStoreInfo) {
  if (PROMOTION_ERROR_CODES[code]) {
    const translationKey = `OrderingPromotion:${PROMOTION_ERROR_CODES[code].desc}`;
    const minSubtotalConsumingPromo = extraInfo || {};
    const { locale, currency, country } = onlineStoreInfo;
    const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');
    let minSubtotal = !(locale && currency)
      ? minSubtotalConsumingPromo
      : Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(minSubtotalConsumingPromo));

    if (country === 'MY' && isSafari) {
      minSubtotal = minSubtotal.replace(/^(\D+)/, '$1 ');
    }

    return PROMOTION_ERROR_CODES[code].desc === '54417NotMatchMinSubtotalConsumingPromo'
      ? i18next.t(translationKey, { minSubtotalConsumingPromo: minSubtotal })
      : i18next.t(translationKey);
  } else {
    return i18next.t(`OrderingPromotion:60000InvalidPromotionOrVoucher`);
  }
}

export const getPromoStatusLabelText = ({ status, validFrom, validTo, expired }) => {
  // Voucher status list: ['expired', 'redeemed', 'pendingRedeem', 'unused']
  switch (status) {
    case VOUCHER_STATUS.EXPIRED:
      return i18next.t('OrderingPromotion:PromoExpiredLabel');
    case VOUCHER_STATUS.REDEEMED:
      return i18next.t('OrderingPromotion:PromoRedeemedLabel');
    default:
      if (expired) return i18next.t('OrderingPromotion:PromoExpiredLabel');
      if (new Date() < new Date(validFrom) || new Date() > new Date(validTo)) {
        return i18next.t('OrderingPromotion:PromoInvalidLabel');
      }
      return '';
  }
};
