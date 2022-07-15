import { createSelector } from '@reduxjs/toolkit';
import { SHIPPING_TYPES } from '../../../../../common/utils/constants';
import {
  getTableId,
  getFormatCurrencyFunction,
  getShippingType,
  getEnablePayLater as getIsEnablePayLater,
  getCartCount,
  getMinimumConsumption,
  getOrderingOngoingBannerVisibility,
  getShoppingCart,
  getIsStoreInfoReady,
} from '../../../../redux/modules/app';
import {
  getCartItemsCount,
  getCartItems as getCartAvailableItems,
  getCartUnavailableItems,
} from '../../../../redux/cart/selectors';

export { getTableId, getShippingType, getIsEnablePayLater, getOrderingOngoingBannerVisibility };

/**
 *  get formatted cart quantity
 * @return cart quantity, for example: 4
 */
export const getCartQuantity = createSelector(
  getIsEnablePayLater,
  getCartItemsCount,
  getCartCount,
  (isEnablePayLater, cartQuantity, payFirstCartQuantity) => (isEnablePayLater ? cartQuantity : payFirstCartQuantity)
);

export const getOriginalCartItems = createSelector(
  getIsEnablePayLater,
  getShoppingCart,
  getCartAvailableItems,
  getCartUnavailableItems,
  (enablePayLater, payFirstShoppingCart, cartAvailableItems, cartUnavailableItems) => {
    const { items, unavailableItems } = payFirstShoppingCart;
    const isCartEmpty = enablePayLater
      ? cartAvailableItems.length <= 0 && cartUnavailableItems.length <= 0
      : items.length <= 0 && unavailableItems.length <= 0;

    if (isCartEmpty) {
      return [];
    }

    return enablePayLater ? [...cartUnavailableItems, ...cartAvailableItems] : [...unavailableItems, ...items];
  }
);

/**
 *  get items cart subtotal
 * @return items subtotal, for example: 10
 */
export const getCartItemsSubtotal = createSelector(
  getIsEnablePayLater,
  getOriginalCartItems,
  (isEnablePayLater, originalCartItems) => {
    if (isEnablePayLater || originalCartItems.length <= 0) {
      return 0;
    }

    let itemsSubtotal = 0;

    originalCartItems.forEach(cartItem => {
      itemsSubtotal += (cartItem.price || cartItem.displayPrice) * cartItem.quantity;
    });

    return itemsSubtotal;
  }
);

/**
 *  for whether display cart footer display
 * @return
 */
export const getIsCartFooterVisible = createSelector(
  getIsStoreInfoReady,
  getShippingType,
  getCartQuantity,
  getTableId,
  (isStoreInfoReady, shippingType, cartQuantity, tableId) => {
    const availableQuantity = cartQuantity > 0;

    return (
      isStoreInfoReady &&
      (shippingType === SHIPPING_TYPES.DINE_IN ? availableQuantity && tableId !== 'DEMO' : availableQuantity)
    );
  }
);

/**
 *  get formatted cart items subtotal
 * @return formatted items subtotal, for example: "RM 10.00"
 */
export const getCartItemsFormattedSubtotal = createSelector(
  getIsEnablePayLater,
  getCartItemsSubtotal,
  getFormatCurrencyFunction,
  (isEnablePayLater, cartItemsSubtotal, formatCurrency) => (isEnablePayLater ? null : formatCurrency(cartItemsSubtotal))
);

/**
 *  is fulfill minimum Consumption, for whether display minimum consumption
 * @return
 */
export const getIsFulfillMinimumConsumption = createSelector(
  getShippingType,
  getMinimumConsumption,
  getCartItemsSubtotal,
  (shippingType, minimumConsumption, cartItemsSubtotal) => {
    // only delivery order will consider minium consumption
    if (shippingType !== SHIPPING_TYPES.DELIVERY) {
      return true;
    }

    return cartItemsSubtotal >= minimumConsumption;
  }
);

/**
 *  minimum Consumption formatted price
 * @return minimum Consumption, for example: "RM 30.00"
 */
export const getMinimumConsumptionFormattedPrice = createSelector(
  getMinimumConsumption,
  getFormatCurrencyFunction,
  (minimumConsumption, formatCurrency) => (minimumConsumption ? formatCurrency(minimumConsumption) : '')
);

/**
 *  formatted Diff Price on Fulfill Minimum Consumption
 * @return diff Price on Fulfill Minimum Consumption, for example: "RM 10.00"
 */
export const getFormattedDiffPriceOnFulfillMinimumConsumption = createSelector(
  getMinimumConsumption,
  getCartItemsSubtotal,
  getIsFulfillMinimumConsumption,
  getFormatCurrencyFunction,
  (minimumConsumption, cartItemsSubtotal, IsFulfillMinimumConsumption, formatCurrency) => {
    if (!IsFulfillMinimumConsumption) {
      return formatCurrency(minimumConsumption - cartItemsSubtotal);
    }

    return '';
  }
);

/**
 * cart quantity by product Id
 * @returns {[productId]: cartQuantity}
 */
export const getCartQuantityByProductId = createSelector(getOriginalCartItems, cartItems => {
  const cartQuantityByProductId = {};
  cartItems.forEach(cartItem => {
    const productId = cartItem.parentProductId || cartItem.productId;

    const currentProductCartQuantity = cartQuantityByProductId[productId] || 0;
    cartQuantityByProductId[productId] = currentProductCartQuantity + cartItem.quantity;
  });

  return cartQuantityByProductId;
});

/**
 * get cart items
 * @return [{
		id: string; // cart item id
		productId: string; // product id
		title: string; // product title
		image: string | null; // product image
		variationTitles: string[]; // variation titles, for example: ["medium", "blue"]
		formattedDisplayPrice: string; // formatted display price, example: "20.00"
		quantity: number;
		isOutOfStock: boolean;        // is out of stock
		isLowStock: boolean;        // is low stock
		isAbleToIncreaseQuantity: boolean; // will be disable on reached quantity on hand
		isAbleToDecreaseQuantity: boolean;
}]
*/
export const getCartItems = createSelector(
  getOriginalCartItems,
  getFormatCurrencyFunction,
  (originalCartItems, formatCurrency) => {
    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    const sortedCartItems = originalCartItems.sort(sortFn);

    return sortedCartItems.map(cartItem => {
      const inventory = cartItem.inventory || cartItem.quantityOnHand;
      const inventoryStatus = cartItem.inventoryStatus || cartItem.stockStatus;
      const isAbleToIncreaseQuantity =
        !(inventoryStatus !== 'notTrackInventory' && inventory && cartItem.quantity > inventory) &&
        !(inventory && cartItem.quantity === inventory);

      return {
        id: cartItem.id,
        productId: cartItem.productId,
        title: cartItem.title,
        image: cartItem.image,
        variationTitles: cartItem.variationTexts,
        formattedDisplayPrice: formatCurrency(cartItem.price || cartItem.displayPrice, { hiddenCurrency: true }),
        formattedOriginalDisplayPrice: formatCurrency(cartItem.originalPrice || cartItem.originalDisplayPrice, {
          hiddenCurrency: true,
        }),
        quantity: cartItem.quantity,
        inventory,
        isOutOfStock: inventoryStatus === 'outOfStock' || inventoryStatus === 'unavailable',
        isLowStock: inventoryStatus === 'lowStock',
        isAbleToIncreaseQuantity,
        isAbleToDecreaseQuantity: cartItem.quantity > 0,
        comments: cartItem.comments,
      };
    });
  }
);

/**
 * get is mini cart drawer visible
 * @return
 */
export const getIsMiniCartDrawerVisible = state => state.menu.cart.miniCartDrawerVisible;

export const getIsEnableMinimumAmount = createSelector(
  getMinimumConsumption,
  minimumConsumption => !!minimumConsumption
);

export const getHiddenMiniOrderStatus = createSelector(
  getIsEnableMinimumAmount,
  getIsFulfillMinimumConsumption,
  (isEnableMinimumAmount, isFulfillMinimumConsumption) => !isEnableMinimumAmount || isFulfillMinimumConsumption
);
