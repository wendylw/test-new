import _get from 'lodash/get';
import { createSelector } from 'reselect';
import {
  getCartItems,
  getIsBillingTotalInvalid,
  getBusinessInfo,
  getCashbackRate,
  getEnableCashback,
  getEnableConditionalFreeShipping,
  getFreeShippingMinAmount,
  getMerchantCountry,
  getMinimumConsumption,
  getShippingType,
  getCartBilling,
} from '../../../../redux/modules/app';

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

export const getCleverTapAttributes = createSelector(
  getBusinessInfo,
  getFreeShippingMinAmount,
  getShippingType,
  getMerchantCountry,
  getEnableCashback,
  getCashbackRate,
  getEnableConditionalFreeShipping,
  getMinimumConsumption,
  getItemsQuantity,
  getTotal,
  getSubtotal,
  (
    businessInfo,
    freeShippingMinAmount,
    shippingType,
    country,
    enableCashback,
    cashbackRate,
    enableConditionalFreeShipping,
    minimumConsumption,
    itemsQuantity,
    total,
    subtotal
  ) => ({
    'store name': _get(businessInfo, 'stores.0.name', ''),
    'store id': _get(businessInfo, 'stores.0.id', ''),
    'free delivery above': freeShippingMinAmount,
    'shipping type': shippingType,
    country,
    cashback: enableCashback ? cashbackRate : undefined,
    'minimum order value': enableConditionalFreeShipping ? minimumConsumption : undefined,
    'cart items quantity': itemsQuantity,
    'cart amount': total,
    'has met minimum order value': subtotal >= minimumConsumption,
  })
);
