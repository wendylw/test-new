import { createSelector } from 'reselect';
import { getCartItems, getIsBillingTotalInvalid } from '../../../../redux/modules/app';

export const getCheckingInventoryPendingState = ({ cart }) => cart.common.cartInventory.status === 'pending';

export const getShouldDisablePayButton = createSelector(
  getCartItems,
  getIsBillingTotalInvalid,
  getCheckingInventoryPendingState,
  (cartItems, isBillingTotalInvalid, pendingCheckingInventory) => {
    const hasNoCartItem = !cartItems || !cartItems.length;
    return hasNoCartItem || isBillingTotalInvalid || pendingCheckingInventory;
  }
);
