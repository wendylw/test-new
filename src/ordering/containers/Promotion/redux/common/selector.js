import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../utils/api/api-utils';
import { getPromotionId } from '../../../../redux/modules/promotion';

export const getApplyPromoPendingStatus = state =>
  state.promoPayLater.common.requestStatus.applyPromo === API_REQUEST_STATUS.PENDING;

export const getPromoErrorCodePayLater = state => state.promoPayLater.common.error.applyPromo;

export const getIsAppliedSuccessPayLater = state => state.promoPayLater.common.appliedResult;

export const getPromoId = createSelector(getPromotionId, id => id);
