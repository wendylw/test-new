import qs from 'qs';
import { push } from 'connected-react-router';
import { createAsyncThunk } from '@reduxjs/toolkit';
import _isNil from 'lodash/isNil';
import { clearCart, updateCartItems, removeCartItemsById } from '../../../../redux/cart/thunks';
import { getOriginalCartItems } from './selectors';
import {
  actions as appActions,
  getShippingType,
  getDeliveryInfo,
  getUser,
  getUserIsLogin,
  getReceiptNumber,
  getEnablePayLater,
} from '../../../../redux/modules/app';
import { tokenExpiredAsync, getTokenAsync } from '../../../../../utils/native-methods';
import {
  isWebview,
  isTNGMiniProgram,
  getSessionVariable,
  getExpectedDeliveryDateFromSession,
  getStoreHashCode,
  getShippingTypeFromUrl,
} from '../../../../../common/utils';
import { SHIPPING_TYPES, PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import loggly from '../../../../../utils/monitoring/loggly';

/**
 * show mini cart drawer
 */
export const showMiniCartDrawer = createAsyncThunk('ordering/menu/cart/showMiniCartDrawer', async () => {});
/**
 * hide mini cart drawer
 */
export const hideMiniCartDrawer = createAsyncThunk('ordering/menu/cart/hideMiniCartDrawer', async () => {});

const gotoNextPage = (shippingType, enablePreOrder, dispatch) => {
  const { search } = window.location;

  if (enablePreOrder) {
    const { address: deliveryToAddress } = JSON.parse(getSessionVariable('deliveryAddress') || '{}');
    const { date, hour } = getExpectedDeliveryDateFromSession();

    if (
      (shippingType === SHIPPING_TYPES.DELIVERY && (!deliveryToAddress || !date.date || !hour)) ||
      (shippingType === SHIPPING_TYPES.PICKUP && (!date.date || !hour.from))
    ) {
      const callbackUrl = encodeURIComponent(`${PATH_NAME_MAPPING.ORDERING_CART}${search}`);

      dispatch(push(`${PATH_NAME_MAPPING.ORDERING_LOCATION_AND_DATE}${search}&callbackUrl=${callbackUrl}`));
    }
  }

  dispatch(push(`${PATH_NAME_MAPPING.ORDERING_CART}${search}`));
};

/**
 * goto Review cart page
 */
export const reviewCart = createAsyncThunk('ordering/menu/cart/reviewCart', async (_, { dispatch, getState }) => {
  dispatch(hideMiniCartDrawer());

  const state = getState();
  const isInsertWebview = isWebview() || isTNGMiniProgram();
  const userSignedIn = getUserIsLogin(state);
  const shippingType = getShippingType(state);
  const deliverInfo = getDeliveryInfo(state);
  const { enablePreOrder } = deliverInfo;

  if (!isInsertWebview || (isInsertWebview && userSignedIn)) {
    gotoNextPage(shippingType, enablePreOrder, dispatch);

    return;
  }

  if (isTNGMiniProgram()) {
    try {
      await dispatch(appActions.loginByTngMiniProgram());

      gotoNextPage(shippingType, enablePreOrder, dispatch);

      return;
    } catch (e) {
      loggly.error('ordering.home.footer', { message: 'TNG mini program login failed' });
    }
  }

  if (isWebview()) {
    const { isExpired } = getUser(state) || {};

    const res = isExpired ? await tokenExpiredAsync() : await getTokenAsync();

    if (_isNil(res)) {
      loggly.error('ordering.home.footer', { message: 'native token is invalid' });
    } else {
      // eslint-disable-next-line camelcase
      const { access_token: accessToken, refresh_token: refreshToken } = res;

      dispatch(appActions.loginApp({ accessToken, refreshToken }));
    }
  }
});

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

    dispatch(push(`${PATH_NAME_MAPPING.ORDERING_TABLE_SUMMARY}${search}`));
  }
);

/**
 * remove all cart items
 */
export const removeAllCartItems = createAsyncThunk(
  'ordering/menu/cart/removeAllCartItems',
  async (_, { dispatch, getState }) => {
    loggly.log('cart-list-drawer.clear-all-attempt');
    // this.cleverTapTrack('Menu Page - Cart Preview - Click clear all');

    const state = getState();
    const enablePayLater = getEnablePayLater(state);

    if (enablePayLater) {
      await dispatch(clearCart());
    } else {
      await dispatch(appActions.clearAll()).then(() => dispatch(appActions.loadShoppingCart()));
    }
  }
);

/**
 * increase cart item quantity
 */
export const increaseCartItemQuantity = createAsyncThunk(
  'ordering/menu/cart/increaseCartItemQuantity',
  async ({ cartItemId }, { dispatch, getState }) => {
    loggly.log('cart-list-drawer.item-operate-attempt');

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);
    const { quantity, productId, variations } = originalCartItems.find(item => item.id === cartItemId) || {};
    const selectedOptions = (variations || []).map(({ variationId, optionId, quantity: variationQuantity }) => ({
      variationId,
      optionId,
      quantity: variationQuantity,
    }));

    // this.handleGtmEventTracking(cartItem);

    if (enablePayLater) {
      dispatch(
        updateCartItems({
          productId,
          quantityChange: 1,
          variations: selectedOptions,
        })
      );
    } else {
      dispatch(
        appActions.addOrUpdateShoppingCartItem({
          action: 'edit',
          productId,
          quantity: quantity + 1,
          variations: selectedOptions,
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
    loggly.log('cart-list-drawer.item-operate-attempt');

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);
    const originalCartItem = originalCartItems.find(item => item.id === cartItemId) || {};

    const { id, productId, variations } = originalCartItem;

    if (enablePayLater) {
      dispatch(removeCartItemsById(id));
    } else {
      dispatch(
        appActions.removeShoppingCartItem({
          productId,
          variations,
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
    loggly.log('cart-list-drawer.item-operate-attempt');

    const state = getState();
    const enablePayLater = getEnablePayLater(state);
    const originalCartItems = getOriginalCartItems(state);

    const originalCartItem = originalCartItems.find(item => item.id === cartItemId) || {};
    const { quantity, productId, variations } = originalCartItem || {};

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
              quantityChange: -1,
              variations: selectedOptions,
            })
          )
        : dispatch(
            appActions.addOrUpdateShoppingCartItem({
              action: 'edit',
              productId,
              quantity: quantity - 1,
              variations: selectedOptions,
            })
          ).then(() => {
            dispatch(appActions.loadShoppingCart());
          });
    }
  }
);