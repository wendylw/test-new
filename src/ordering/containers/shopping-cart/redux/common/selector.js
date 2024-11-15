import { createSelector } from 'reselect';
import { getCartItems, getUserIsLogin, getIsBillingTotalInvalid } from '../../../../redux/modules/app';
import { getIsLoadUniquePromosAvailableCountCompleted } from '../../../../redux/modules/common/selectors';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

export const getCheckingInventoryPendingState = ({ shoppingCart }) =>
  shoppingCart.common.cartInventory.status === API_REQUEST_STATUS.PENDING;

export const getShouldDisablePayButton = createSelector(
  getCartItems,
  getIsBillingTotalInvalid,
  getCheckingInventoryPendingState,
  getUserIsLogin,
  getIsLoadUniquePromosAvailableCountCompleted,
  (cartItems, isBillingTotalInvalid, pendingCheckingInventory, isLogin, isLoadUniquePromosAvailableCountCompleted) => {
    const hasNoCartItem = !cartItems || !cartItems.length;
    return (
      hasNoCartItem ||
      isBillingTotalInvalid ||
      pendingCheckingInventory ||
      (isLogin && !isLoadUniquePromosAvailableCountCompleted)
    );
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
