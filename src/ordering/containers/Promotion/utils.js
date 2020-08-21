import Constants from '../../../utils/constants';
import { toISODateString } from '../../../utils/datetime-lib';
import i18next from 'i18next';

const { PROMOTION_APPLIED_STATUS } = Constants;

export function getErrorMessageByPromoStatus({ status, validFrom }) {
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
      return i18next.t('OrderingPromotion:NotStart', { date: toISODateString(validFrom) });
    case PROMOTION_APPLIED_STATUS.NOT_AVAILABLE:
      return i18next.t('OrderingPromotion:NotAvailable');
    case PROMOTION_APPLIED_STATUS.NOT_VALID:
      return i18next.t('OrderingPromotion:NotValid');
    case PROMOTION_APPLIED_STATUS.NOT_EXISTED:
    case PROMOTION_APPLIED_STATUS.UNKNOWN_DISCOUNT_TYPE:
      return i18next.t('OrderingPromotion:NotExisted');
    case PROMOTION_APPLIED_STATUS.REACH_MAX_CLAIM_COUNT:
      return i18next.t('OrderingPromotion:ReachedMaxClaimCount');
    case PROMOTION_APPLIED_STATUS.REACH_CUSTOMER_CLAIM_COUNT_LIMIT:
      return i18next.t('OrderingPromotion:ReachCustomerClaimCountLimit');
    case PROMOTION_APPLIED_STATUS.REQUIRE_CUSTOMER:
      return i18next.t('OrderingPromotion:RequireCustomer');
    case PROMOTION_APPLIED_STATUS.REQUIRE_FIRST_TIME_PURCHASE:
      return i18next.t('OrderingPromotion:RequireFirstTimePurchase');
    case PROMOTION_APPLIED_STATUS.INVALID:
    default:
      return i18next.t('OrderingPromotion:Invalid');
  }
}
