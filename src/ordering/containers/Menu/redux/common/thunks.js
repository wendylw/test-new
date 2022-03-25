import _get from 'lodash/get';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions, getStoreId, getStoreInfoForCleverTap, getTableId } from '../../../../redux/modules/app';
import { getIsProductListReady, getIsEnablePayLater, getIsStoreInfoReady } from './selectors';
import { queryCartAndStatus, clearQueryCartStatus } from '../../../../redux/cart/thunks';
import { PATH_NAME_MAPPING, SHIPPING_TYPES } from '../../../../../common/utils/constants';
import { getShippingTypeFromUrl, isDineInType } from '../../../../../common/utils';
import Clevertap from '../../../../../utils/clevertap';

const ensureTableId = state => {
  const tableId = getTableId(state);
  const storeId = getStoreId(state);

  if (storeId) {
    if (!tableId) {
      window.location.href = `${PATH_NAME_MAPPING.DINE}?s=${storeId}&from=home`;
    }
  } else {
    window.location.href = PATH_NAME_MAPPING.DINE;
  }
};

const ensureShippingType = () => {
  const shippingType = getShippingTypeFromUrl();
  const validShippingTypes = new Set(Object.values(SHIPPING_TYPES));
  if (!validShippingTypes.has(shippingType)) {
    window.location.href = window.location.origin;
  }
};

/**
 * Ordering Menu page mounted
 */
export const mounted = createAsyncThunk('ordering/menu/mounted', async (_, { dispatch, getState }) => {
  // - Redirect to `/dine` page if missing `tableId`
  // - Load Product List
  // - Load user alcohol concept data if needed
  // - Load Core Business Data
  // - Load shopping Cart data & status
  // - CleverTap push event, `Menu Page - View page`

  const state = getState();
  const storeId = getStoreId(state);
  let enablePayLater = getIsEnablePayLater(state);
  const isStoreInfoReady = getIsStoreInfoReady(state);
  const isProductListReady = getIsProductListReady(state);

  ensureShippingType();
  if (isDineInType()) {
    ensureTableId(state);
  }

  if (!isProductListReady) {
    dispatch(appActions.loadProductList());
  }

  try {
    if (!isStoreInfoReady) {
      const coreBusinessAction = await dispatch(appActions.loadCoreBusiness());
      const originalCoreBusinessResult = coreBusinessAction?.responseGql?.data?.business || {};
      enablePayLater = _get(originalCoreBusinessResult, 'qrOrderingSettings.enablePayLater', false);
    }

    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());

    Clevertap.pushEvent('Menu Page - View page', storeInfoForCleverTap);

    if (storeId) {
      enablePayLater ? dispatch(queryCartAndStatus()) : dispatch(appActions.loadShoppingCart());
    }
  } catch (e) {
    console.error('load core business or load shopping cart failed on menu page');

    throw e;
  }
});

/**
 * Ordering Menu Page willUnmount
 */
export const willUnmount = createAsyncThunk('ordering/menu/willUnmount', async (_, { dispatch, getState }) => {
  // clear resources if need
  const state = getState();
  const enablePayLater = getIsEnablePayLater(state);

  if (enablePayLater) {
    await dispatch(clearQueryCartStatus());
  }
});

/**
 * Select a category
 */
export const selectCategory = createAsyncThunk('ordering/menu/selectCategory', (categoryId, { getState }) => {
  const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
  Clevertap.pushEvent('Menu Page - Click category', storeInfoForCleverTap);
  return categoryId;
});
