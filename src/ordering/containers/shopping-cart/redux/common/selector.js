import { createSelector } from 'reselect';
import { getCartItems, getIsBillingTotalInvalid } from '../../../../redux/modules/app';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

export const getCheckingInventoryPendingState = ({ shoppingCart }) =>
  shoppingCart.common.cartInventory.status === API_REQUEST_STATUS.PENDING;

export const getShouldDisablePayButton = createSelector(
  getCartItems,
  getIsBillingTotalInvalid,
  getCheckingInventoryPendingState,
  (cartItems, isBillingTotalInvalid, pendingCheckingInventory) => {
    const hasNoCartItem = !cartItems || !cartItems.length;
    return hasNoCartItem || isBillingTotalInvalid || pendingCheckingInventory;
  }
);

export const getReloadBillingByCashbackRequest = state => state.shoppingCart.common.reloadBillingByCashbackRequest;

export const getIsReloadBillingByCashbackRequestPending = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.PENDING
);

export const getIsReloadBillingByCashbackRequestRejected = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.REJECTED
);
