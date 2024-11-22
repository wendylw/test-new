import { createSelector } from 'reselect';
import { getFulfillDate, getQueryString } from '../../../../common/utils';
import {
  getIsApplyPromoOrVoucherPending,
  getIsApplyPayLaterPromoOrVoucherPending,
} from '../../../../redux/modules/rewards/selectors';
import { getBusinessUTCOffset } from '../../../redux/modules/app';

export const getPayLaterReceiptNumber = () => getQueryString('receiptNumber');

/*
 * Selectors derived from state
 */
export const getApplyRewardFulfillDate = createSelector(getBusinessUTCOffset, businessUTCOffset =>
  getFulfillDate(businessUTCOffset)
);

export const getIsApplyRewardPending = createSelector(
  getIsApplyPromoOrVoucherPending,
  getIsApplyPayLaterPromoOrVoucherPending,
  (isApplyPromoOrVoucherPending, isApplyPayLaterPromoOrVoucherPending) =>
    isApplyPromoOrVoucherPending || isApplyPayLaterPromoOrVoucherPending
);
