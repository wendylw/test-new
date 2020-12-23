import Constants from '../../../utils/constants';
import i18next from 'i18next';

const { PROMOTION_ERROR_CODES } = Constants;

export function getErrorMessageByPromoStatus({ code, extraInfo }) {
  const {} = extraInfo;

  if (PROMOTION_ERROR_CODES[code]) {
    return i18next.t(`OrderingPromotion:${PROMOTION_ERROR_CODES[code].desc}`);
  } else {
    return i18next.t(`OrderingPromotion:60000InvalidPromotionOrVoucher`);
  }
}
