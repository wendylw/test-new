import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getCartItems, getIsBillingTotalInvalid, getBusinessInfo } from '../../../../redux/modules/app';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

export const getCheckingInventoryPendingState = ({ cart }) =>
  cart.common.cartInventory.status === API_REQUEST_STATUS.PENDING;

export const getShouldDisablePayButton = createSelector(
  getCartItems,
  getIsBillingTotalInvalid,
  getCheckingInventoryPendingState,
  (cartItems, isBillingTotalInvalid, pendingCheckingInventory) => {
    const hasNoCartItem = !cartItems || !cartItems.length;
    return hasNoCartItem || isBillingTotalInvalid || pendingCheckingInventory;
  }
);

export const getCleverTapAttributes = createSelector(getBusinessInfo, businessInfo => ({
  'store name': _get(businessInfo, 'stores.0.name', ''),
  'store id': _get(businessInfo, 'stores.0.id', ''),
}));

export const getReloadBillingByCashbackRequest = state => state.cart.common.reloadBillingByCashbackRequest;

export const getIsReloadBillingByCashbackRequestPending = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.PENDING
);

export const getIsReloadBillingByCashbackRequestRejected = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.REJECTED
);
