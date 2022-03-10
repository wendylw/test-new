import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { actions as appActions, getBusiness, getEnablePayLater } from '../../../../redux/modules/app';
import { updateCartItems } from '../../../../redux/cart/thunks';
import {
  getSelectedProductId,
  getSelectedChildProductId,
  getSelectedQuantity,
  getSelectedVariationDataForAddToCartApi,
  getProductVariationsDetail,
} from './selectors';

/**
 * Show product detail drawer
 * Reset the selected variation options
 * Reset the select quantity to 1
 */
export const showProductDetailDrawer = createAsyncThunk(
  'ordering/menu/productDetail/showProductDetailDrawer',
  async ({ productId, categoryId }, { dispatch }) => {
    const result = await dispatch(appActions.loadProductDetail(productId));
    const productVariations = _get(result, 'responseGql.data.product.variations', []);

    const selectedOptionsByVariationId = {};
    productVariations
      .filter(variation => variation.variationType === 'SingleChoice')
      .forEach(variation => {
        const defaultSelectedOption = _get(variation, 'optionValues.0', null);
        selectedOptionsByVariationId[variation.id] = {
          optionId: _get(defaultSelectedOption, 'id', null),
          value: _get(defaultSelectedOption, 'value', null),
        };
      });

    return {
      productId,
      categoryId,
      selectedOptionsByVariationId,
    };
  }
);

/**
 * hide product detail drawer
 */
export const hideProductDetailDrawer = createAsyncThunk(
  'ordering/menu/productDetail/hideProductDetailDrawer',
  async () => {}
);

export const decreaseProductQuantity = createAsyncThunk(
  'ordering/menu/productDetail/decreaseProductQuantity',
  async () => {}
);

export const increaseProductQuantity = createAsyncThunk(
  'ordering/menu/productDetail/increaseProductQuantity',
  async () => {}
);

const getSelectedVariationAndOption = (state, variationId, optionId) => {
  const productVariations = getProductVariationsDetail(state);
  const selectedVariation = _find(productVariations, { id: variationId });
  const options = _get(selectedVariation, 'options', []);
  const option = _find(options, { id: optionId });

  return {
    variation: selectedVariation,
    option,
  };
};

export const selectVariationOption = createAsyncThunk(
  'ordering/menu/productDetail/selectVariationOption',
  async ({ variationId, optionId }, { getState }) => {
    const state = getState();
    const { variation, option } = getSelectedVariationAndOption(state, variationId, optionId);

    const type = _get(variation, 'type', null);
    const value = _get(option, 'value', null);

    return {
      variationId,
      optionId,
      value,
      type,
    };
  }
);

export const unselectVariationOption = createAsyncThunk(
  'ordering/menu/productDetail/unselectVariationOption',
  ({ variationId, optionId }) => ({
    variationId,
    optionId,
  })
);

export const decreaseVariationOptionQuantity = createAsyncThunk(
  'ordering/menu/productDetail/decreaseVariationOptionQuantity',
  async ({ variationId, optionId }) => ({
    variationId,
    optionId,
  })
);

export const increaseVariationOptionQuantity = createAsyncThunk(
  'ordering/menu/productDetail/increaseVariationOptionQuantity',
  async ({ variationId, optionId }, { getState }) => {
    const state = getState();
    const { variation, option } = getSelectedVariationAndOption(state, variationId, optionId);

    const type = _get(variation, 'type', null);
    const value = _get(option, 'value', null);

    return {
      variationId,
      optionId,
      value,
      type,
    };
  }
);

export const addToCart = createAsyncThunk(
  'ordering/menu/productDetail/addToCart',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const isEnablePayLater = getEnablePayLater(state);
    const parentProductId = getSelectedProductId(state);
    const childProductId = getSelectedChildProductId(state);
    const quantity = getSelectedQuantity(state);
    const variations = getSelectedVariationDataForAddToCartApi(state);

    if (isEnablePayLater) {
      dispatch(
        updateCartItems({
          productId: childProductId || parentProductId,
          quantityChange: quantity,
          variations,
        })
      );
    } else {
      await dispatch(
        appActions.addOrUpdateShoppingCartItem({
          action: 'add',
          business,
          productId: childProductId || parentProductId,
          quantity,
          variations,
        })
      );
      await dispatch(appActions.loadShoppingCart());
    }
    dispatch(hideProductDetailDrawer());
  }
);
