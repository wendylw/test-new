import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getCartItems, getIsBillingTotalInvalid, getBusinessInfo, getCartBilling } from '../../../../redux/modules/app';

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

export const getItemsQuantity = createSelector(getCartBilling, data => data.itemsQuantity);
export const getTotal = createSelector(getCartBilling, data => data.total);
export const getSubtotal = createSelector(getCartBilling, data => data.subtotal);

export const getCleverTapAttributes = createSelector(getBusinessInfo, businessInfo => ({
  'store name': _get(businessInfo, 'stores.0.name', ''),
  'store id': _get(businessInfo, 'stores.0.id', ''),
}));
