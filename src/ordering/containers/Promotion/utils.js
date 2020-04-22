import Constants from '../../../utils/constants';
import { toNumericDate } from '../../../utils/datetime-lib';
import i18next from 'i18next';

const { PROMOTION_APPLIED_STATUS } = Constants;

export function getErrorMessageByPromoStatus({ status, validFrom }, merchantCountry) {
  switch (status) {
    case PROMOTION_APPLIED_STATUS.VALID:
      return '';
    case PROMOTION_APPLIED_STATUS.REDEEMED:
      return i18next.t('OrderingPromotion:Redeemed');
    case PROMOTION_APPLIED_STATUS.NOT_MATCH_MINIMUM_PURCHASE:
      return i18next.t('OrderingPromotion:NotMatchMinimumPurchase');
    case PROMOTION_APPLIED_STATUS.EXPIRED:
      return i18next.t('OrderingPromotion:Expired');
    case PROMOTION_APPLIED_STATUS.NOT_START:
      return i18next.t('OrderingPromotion:NotStart', { date: toNumericDate(validFrom, merchantCountry) });
    case PROMOTION_APPLIED_STATUS.INVALID:
    default:
      return i18next.t('OrderingPromotion:Invalid');
  }
}
