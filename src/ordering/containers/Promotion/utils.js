import Constants from '../../../utils/constants';
import i18next from 'i18next';

const { PROMOTION_ERROR_CODES, VOUCHER_STATUS } = Constants;

export function getErrorMessageByPromoErrorCode({ code, extraInfo, currency }) {
  const { minSubtotalConsumingPromo } = extraInfo;
  const i18nextArgus = { minSubtotalConsumingPromo: `${currency}${minSubtotalConsumingPromo}` };

  if (PROMOTION_ERROR_CODES[code]) {
    return i18next.t(
      `OrderingPromotion:${PROMOTION_ERROR_CODES[code].desc}`,
      PROMOTION_ERROR_CODES[code].i18nextArgus(i18nextArgus) || {}
    );
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
