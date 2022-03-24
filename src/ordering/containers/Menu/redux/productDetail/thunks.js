import { createAsyncThunk } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _isNil from 'lodash/isNil';
import {
  actions as appActions,
  getAllProducts,
  getBusiness,
  getEnablePayLater,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import { updateCartItems } from '../../../../redux/cart/thunks';
import {
  getSelectedProductId,
  getSelectedChildProductId,
  getSelectedQuantity,
  getSelectedVariationDataForAddToCartApi,
  getProductVariationsDetail,
  getSelectedProduct,
  getSelectedCategory,
  getAddToCartGTMData,
} from './selectors';
import Clevertap from '../../../../../utils/clevertap';
import { getAllCategories } from '../../../../../redux/modules/entities/categories';
import { PRODUCT_STOCK_STATUS } from '../../constants';
import { gtmEventTracking, GTM_TRACKING_EVENTS } from '../../../../../utils/gtm';

/**
 * get product clever tap data
 */
const getProductCleverTapAttributes = (selectedProduct, selectedCategory) => {
  const product = selectedProduct || {};
  const category = selectedCategory || {};
  const index = _findIndex(category.products, productId => productId === product.id);

  return {
    'category name': category.name,
    'category rank': category.rank,
    'product name': product.title,
    'product rank': index > -1 ? index + 1 : null,
    'product image url': product.images?.length > 0 ? product.images[0] : '',
    amount: !_isNil(product.originalDisplayPrice) ? product.originalDisplayPrice : product.displayPrice,
    discountedprice: !_isNil(product.originalDisplayPrice) ? product.displayPrice : '',
    'is bestsellar': product.isFeaturedProduct,
    'has picture': product.images?.length > 0,
  };
};

const getDefaultSelectedOptions = product => {
  try {
    const productChildrenMap = _get(product, 'childrenMap', []);
    const productVariations = _get(product, 'variations', []);

    const productSingleVariation = productVariations.filter(variation => variation.variationType === 'SingleChoice');

    const childProduct = productChildrenMap.find(child => child.stockStatus !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK);

    // no child product OR all child product are out of stock
    if (!childProduct) {
      const selectedOptionsByVariationId = {};
      // select the first option from single variations
      productSingleVariation.forEach(variation => {
        const defaultSelectedOption = variation.optionValues[0];

        selectedOptionsByVariationId[variation.id] = {
          optionId: defaultSelectedOption.id,
          value: defaultSelectedOption.value,
        };
      });

      return selectedOptionsByVariationId;
    }

    const selectedOptionsByVariationId = {};

    childProduct.variationValues.forEach(variationValue => {
      const variation = productSingleVariation.find(
        singleVariation => singleVariation.id === variationValue.variationId
      );
      const option = variation.optionValues.find(optionValue => optionValue.value === variationValue.value);

      selectedOptionsByVariationId[variation.id] = {
        optionId: option.id,
        value: option.value,
      };
    });

    return selectedOptionsByVariationId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getDefaultSelectedOptions occur error: ', error.message);
    return {};
  }
};

const getViewProductGTMData = product => {
  const stockStatusMapping = {
    outOfStock: 'out of stock',
    inStock: 'in stock',
    lowStock: 'low stock',
    unavailable: 'unavailable',
    notTrackInventory: 'not track Inventory',
  };

  return {
    product_name: product.title,
    product_id: product.id,
    price_local: product.displayPrice,
    product_type: product.inventoryType,
    Inventory: stockStatusMapping[product.stockStatus] || stockStatusMapping.inStock,
    image_count: _get(product, 'images.length', 0),
    product_description: product.description,
  };
};

/**
 * Show product detail drawer
 * Reset the selected variation options
 * Reset the select quantity to 1
 */
export const showProductDetailDrawer = createAsyncThunk(
  'ordering/menu/productDetail/showProductDetailDrawer',
  async ({ productId, categoryId }, { dispatch, getState }) => {
    const allProducts = getAllProducts(getState());
    const allCategories = getAllCategories(getState());
    const product = _get(allProducts, productId, null);
    const category = _get(allCategories, categoryId, null);

    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Menu Page - Click product', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });

    const result = await dispatch(appActions.loadProductDetail(productId));

    Clevertap.pushEvent('Menu Page - View products', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });

    const productInResult = _get(result, 'responseGql.data.product', null);

    gtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, getViewProductGTMData(productInResult));

    return {
      productId,
      categoryId,
      selectedOptionsByVariationId: getDefaultSelectedOptions(productInResult),
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
  async (_, { getState }) => {
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Product details - Decrease quantity', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });
  }
);

export const increaseProductQuantity = createAsyncThunk(
  'ordering/menu/productDetail/increaseProductQuantity',
  async (_, { getState }) => {
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Product details - Increase quantity', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });
  }
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
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);
    const addToCartGtmData = getAddToCartGTMData(state);

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, addToCartGtmData);

    Clevertap.pushEvent('Menu Page - Add to Cart', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });

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
