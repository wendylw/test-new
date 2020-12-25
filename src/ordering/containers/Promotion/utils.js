import Constants from '../../../utils/constants';
import i18next from 'i18next';

const { PROMOTION_ERROR_CODES } = Constants;

export function getErrorMessageByPromoErrorCode({ code, extraInfo }) {
  const {} = extraInfo;

  if (PROMOTION_ERROR_CODES[code]) {
    return i18next.t(`OrderingPromotion:${PROMOTION_ERROR_CODES[code].desc}`);
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
