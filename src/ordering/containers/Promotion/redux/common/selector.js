import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../utils/api/api-utils';
import { getPromotionId, getPromoCode, getSelectedPromo } from '../../../../redux/modules/promotion';
import Constants from '../../../../../utils/constants';

const { PROMO_TYPE } = Constants;

export const getApplyPromoPendingStatus = state =>
  state.promoPayLater.common.requestStatus.applyPromo === API_REQUEST_STATUS.PENDING;

export const getPromoErrorCodePayLater = state => state.promoPayLater.common.error.applyPromo;

export const getIsAppliedSuccessPayLater = state => state.promoPayLater.common.appliedResult;

export const getPromoId = createSelector(getPromotionId, id => id);

export const getPromoCodePayLater = createSelector(getPromoCode, code => code);

export const getSelectPromoOrVoucherPayLater = createSelector(getSelectedPromo, selectedPromo => {
  const { type } = selectedPromo;

  if (type === PROMO_TYPE.PROMOTION) {
    return true;
  }
  return false;
});