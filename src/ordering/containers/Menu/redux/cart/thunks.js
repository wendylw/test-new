import qs from 'qs';
import _isNil from 'lodash/isNil';
import { push } from 'connected-react-router';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  clearCart,
  updateCartItems,
  removeCartItemsById,
  clearQueryCartStatus,
} from '../../../../redux/modules/cart/thunks';
import { getCartReceiptNumber as getReceiptNumber } from '../../../../redux/modules/cart/selectors';
import { getOriginalCartItems } from './selectors';
import {
  actions as appActions,
  getEnablePayLater,
  getStoreInfoForCleverTap,
  getPaymentInfoForCleverTap,
} from '../../../../redux/modules/app';
import { getStoreHashCode, getShippingTypeFromUrl } from '../../../../../common/utils';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import logger from '../../../../../utils/monitoring/logger';
import Clevertap from '../../../../../utils/clevertap';
import { gtmEventTracking, GTM_TRACKING_EVENTS, STOCK_STATUS_MAPPING } from '../../../../../utils/gtm';

/**
 * show mini cart drawer
 */
export const showMiniCartDrawer = createAsyncThunk('ordering/menu/cart/showMiniCartDrawer', async (_, { getState }) => {
  const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
  Clevertap.pushEvent('Menu Page - Click cart', storeInfoForCleverTap);
});
/**
 * hide mini cart drawer
 */
export const hideMiniCartDrawer = createAsyncThunk('ordering/menu/cart/hideMiniCartDrawer', async () => {});

/**
 * goto table summary page
 */
export const viewOnGoingOrder = createAsyncThunk(
  'ordering/menu/cart/viewOnGoingOrder',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const receiptNumber = getReceiptNumber(state);
    const search = qs.stringify(
      {
        h: getStoreHashCode(),
        type: getShippingTypeFromUrl(),
        receiptNumber,
      },
      { addQueryPrefix: true }
    );

    dispatch(clearQueryCartStatus());
    dispatch(push(`${PATH_NAME_MAPPING.ORDERING_TABLE_SUMMARY}${search}`));
  }
);

/**
 * remove all cart items
 */
export const removeAllCartItems = createAsyncThunk(
  'ordering/menu/cart/removeAllCartItems',
  async (_, { dispatch, getState }) => {
    logger.log('Ordering_MenuCart_ClearAllItems');

    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Menu Page - Cart Preview - Click clear all', storeInfoForCleverTap);

    const state = getState();
    const enablePayLater = getEnablePayLater(state);

    if (enablePayLater) {
      await dispatch(clearCart());
    } else {
      await dispatch(appActions.clearAll()).then(() => dispatch(appActions.loadShoppingCart()));
    }
  }
);

const getCartItemCleverTapAttributes = cartItem => ({
  'category name': cartItem.categoryName,
  'category rank': cartItem.categoryRank,
  'product name': cartItem.title,
  'product rank': cartItem.rank,
  'product image url': cartItem.images?.length > 0 ? cartItem.images[0] : '',
  amount: !_isNil(cartItem.originalDisplayPrice) ? cartItem.originalDisplayPrice : cartItem.displayPrice,
  discountedprice: !_isNil(cartItem.originalDisplayPrice) ? cartItem.displayPrice : '',
  'is bestsellar': cartItem.isFeaturedProduct,
  'has picture': cartItem.images?.length > 0,
});

const getCartItemGTMData = cartItem =>
  // In cart list, image count is always either 1 or 0
  ({
    product_name: cartItem.title,
    product_id: cartItem.productId,
    price_local: cartItem.displayPrice,
    variant: cartItem.variations,
    quantity: cartItem.quantityOnHand,
    product_type: cartItem.inventoryType,
    Inventory: STOCK_STATUS_MAPPING[cartItem.stockStatus] || STOCK_STATUS_MAPPING.inStock,
    image_count: cartItem.image ? 1 : 0,
  });
/**
 * increase cart item quantity
 */
export const increaseCartItemQuantity = createAsyncThunk(
  'ordering/menu/cart/increaseCartItemQuantity',
  async ({ cartItemId }, { dispatch, getState }) => {
    logger.log('Ordering_MenuCart_AdjustItemQuantity', { action: 'increase' });

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);
    const originalCartItem = originalCartItems.find(item => item.id === cartItemId) || {};
    const { quantity, productId, variations, isTakeaway } = originalCartItem;
    const selectedOptions = (variations || []).map(({ variationId, optionId, quantity: variationQuantity }) => ({
      variationId,
      optionId,
      quantity: variationQuantity,
    }));
    const cartItemCleverTapAttributes = getCartItemCleverTapAttributes(originalCartItem);
    const paymentInfoForCleverTap = getPaymentInfoForCleverTap(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(state);
    const cartItemGTMData = getCartItemGTMData(originalCartItem);
    const { comments } = originalCartItem;

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, cartItemGTMData);

    Clevertap.pushEvent('Menu Page - Cart Preview - Increase quantity', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
      ...cartItemCleverTapAttributes,
    });

    // this.handleGtmEventTracking(cartItem);

    if (enablePayLater) {
      dispatch(
        updateCartItems({
          productId,
          comments,
          quantityChange: 1,
          variations: selectedOptions,
          isTakeaway,
        })
      );
    } else {
      dispatch(
        appActions.addOrUpdateShoppingCartItem({
          action: 'edit',
          productId,
          comments,
          quantity: quantity + 1,
          variations: selectedOptions,
          isTakeaway,
        })
      ).then(() => {
        dispatch(appActions.loadShoppingCart());
      });
    }
  }
);

/**
 * remove a cart item
 */
export const removeCartItem = createAsyncThunk(
  'ordering/menu/cart/removeCartItem',
  async ({ cartItemId }, { dispatch, getState }) => {
    logger.log('Ordering_MenuCart_AdjustItemQuantity', { action: 'remove' });

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);
    const originalCartItem = originalCartItems.find(item => item.id === cartItemId) || {};
    const { comments, isTakeaway } = originalCartItem;

    const { id, productId, variations } = originalCartItem;

    if (enablePayLater) {
      dispatch(removeCartItemsById(id));
    } else {
      dispatch(
        appActions.removeShoppingCartItem({
          productId,
          comments,
          variations,
          isTakeaway,
        })
      ).then(() => {
        dispatch(appActions.loadShoppingCart());
      });
    }
  }
);

/**
 * decrease cart item quantity
 */
export const decreaseCartItemQuantity = createAsyncThunk(
  'ordering/menu/cart/decreaseCartItemQuantity',
  async ({ cartItemId }, { dispatch, getState }) => {
    logger.log('Ordering_MenuCart_AdjustItemQuantity', { action: 'decrease' });

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);

    const originalCartItem = originalCartItems.find(item => item.id === cartItemId) || {};
    const { quantity, productId, variations } = originalCartItem || {};

    const paymentInfoForCleverTap = getPaymentInfoForCleverTap(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(state);
    const cartItemCleverTapAttributes = getCartItemCleverTapAttributes(originalCartItem);
    const { comments, isTakeaway } = originalCartItem;

    Clevertap.pushEvent('Menu Page - Cart Preview - Decrease quantity', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
      ...cartItemCleverTapAttributes,
    });

    if (quantity === 1) {
      dispatch(removeCartItem({ cartItemId }));
    } else {
      const selectedOptions = (variations || []).map(({ variationId, optionId, quantity: variationQuantity }) => ({
        variationId,
        optionId,
        quantity: variationQuantity,
      }));

      enablePayLater
        ? dispatch(
            updateCartItems({
              productId,
              comments,
              quantityChange: -1,
              variations: selectedOptions,
              isTakeaway,
            })
          )
        : dispatch(
            appActions.addOrUpdateShoppingCartItem({
              action: 'edit',
              productId,
              comments,
              quantity: quantity - 1,
              variations: selectedOptions,
              isTakeaway,
            })
          ).then(() => {
            dispatch(appActions.loadShoppingCart());
          });
    }
  }
);
