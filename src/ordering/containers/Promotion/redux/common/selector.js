import { createSelector } from 'reselect';
import { getSelectedPromo } from '../../../../redux/modules/promotion';
import Constants, { API_REQUEST_STATUS } from '../../../../../utils/constants';

const { PROMO_TYPE } = Constants;

export const getApplyPromoPendingStatus = state =>
  state.promoPayLater.common.requestStatus.applyPromo === API_REQUEST_STATUS.PENDING;

export const getPromoErrorCodePayLater = state => state.promoPayLater.common.error.applyPromo;

export const getAppliedResultPayLater = state => state.promoPayLater.common.appliedResult;

export const getIsAppliedSuccessPayLater = createSelector(
  getAppliedResultPayLater,
  appliedResult => appliedResult.success === true
);

export const getIsAppliedErrorPayLater = createSelector(
  getAppliedResultPayLater,
  appliedResult => appliedResult.success === false
);

export const getSelectPromoOrVoucherPayLater = createSelector(getSelectedPromo, selectedPromo => {
  const { type } = selectedPromo;

  if (type === PROMO_TYPE.PROMOTION) {
    return true;
  }
  return false;
});

export const getApplyVoucherPendingStatus = state =>
  state.promoPayLater.common.requestStatus.applyVoucherPayLater === API_REQUEST_STATUS.PENDING;

export const getApplyPromoOrVoucherPendingStatus = createSelector(
  getApplyPromoPendingStatus,
  getApplyVoucherPendingStatus,
  (applyPromoPendingStatus, applyVoucherPendingStatus) => applyPromoPendingStatus || applyVoucherPendingStatus
);
