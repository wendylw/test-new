import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
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
  getPaymentInfoForCleverTap,
  getHasSelectedStore,
  getIsPickUpType,
  getFoodTagsForCleverTap,
  getIsProductDetailRequestRejected,
  getIsAddOrUpdateShoppingCartItemRejected,
  getAddOrUpdateShoppingCartItemErrorCategory,
  getProductDetailErrorCategory,
} from '../../../../redux/modules/app';
import { updateCartItems } from '../../../../redux/modules/cart/thunks';
import {
  getSelectedProductId,
  getSelectedChildProductId,
  getSelectedQuantity,
  getSelectedVariationDataForAddToCartApi,
  getProductVariationsDetail,
  getSelectedProduct,
  getSelectedCategory,
  getAddToCartGTMData,
  getNotesContents,
  getIsTakeawayProduct,
} from './selectors';
import Clevertap from '../../../../../utils/clevertap';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import { getAllCategories } from '../../../../../redux/modules/entities/categories';
import { PRODUCT_STOCK_STATUS } from '../../../../../common/utils/constants';
import { toast } from '../../../../../common/utils/feedback/toast';
import { gtmEventTracking, GTM_TRACKING_EVENTS, STOCK_STATUS_MAPPING } from '../../../../../utils/gtm';
import { getIfAddressInfoExists } from '../../../../../redux/modules/address/selectors';
import {
  showLocationConfirmModal,
  showStoreListDrawer,
  showTimeSlotDrawer,
  saveSelectedProductItemInfo,
  cleanUpSelectedProductItemInfoIfNeeded,
} from '../common/thunks';
import { getHasSelectedExpectedDeliveryTime, getShouldShowProductDetailDrawer } from '../common/selectors';
import { isVariationOptionAvailable } from '../../utils';
import logger from '../../../../../utils/monitoring/logger';
import ApiFetchError from '../../../../../utils/api/api-fetch-error';

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
    const shareModifierSingleVariations = productSingleVariation.filter(variation => variation.isModifier);
    const setUntrackInventorySelectedOptions = variations => {
      const selectedOptions = {};

      variations.forEach(variation => {
        // WB-4385: If the variation is not Track Inventory, we should set the default option to the first available option.
        // WB-6451: If not any available option, set the first option as default.
        const defaultSelectedOption =
          variation.optionValues.find(option =>
            isVariationOptionAvailable({
              variationType: variation.variationType,
              variationShareModifier: variation.isModifier,
              optionValue: option.value,
              optionMarkedSoldOut: option.markedSoldOut,
              productChildrenMap,
            })
          ) ?? variation.optionValues[0];

        selectedOptions[variation.id] = {
          optionId: defaultSelectedOption.id,
          value: defaultSelectedOption.value,
        };
      });

      return selectedOptions;
    };

    const selectedOptionsByVariationId = {
      ...setUntrackInventorySelectedOptions(shareModifierSingleVariations),
    };

    // no child product OR all child product are out of stock
    if (!childProduct) {
      return {
        ...selectedOptionsByVariationId,
        ...setUntrackInventorySelectedOptions(productSingleVariation),
      };
    }

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
    console.error('Ordering Menu getDefaultSelectedOptions occur error:', error?.message || '');
    return {};
  }
};

const getViewProductGTMData = product => ({
  product_name: product.title,
  product_id: product.id,
  price_local: product.displayPrice,
  product_type: product.inventoryType,
  Inventory: STOCK_STATUS_MAPPING[product.stockStatus] || STOCK_STATUS_MAPPING.inStock,
  image_count: _get(product, 'images.length', 0),
  product_description: product.description,
});

export const takeawayOptionChecked = createAsyncThunk(
  'ordering/menu/productDetail/takeawayOptionChecked',
  async (_, { getState }) => {
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Product details - Check Takeaway option', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });
  }
);

export const takeawayOptionUnchecked = createAsyncThunk(
  'ordering/menu/productDetail/takeawayOptionUnchecked',
  async (_, { getState }) => {
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Product details - Uncheck Takeaway option', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });
  }
);

export const resetTakeawayOptionCheckState = createAsyncThunk(
  'ordering/menu/productDetail/resetTakeawayOptionCheckState',
  async () => {}
);
/**
 * Show product detail drawer
 * Reset the selected variation options
 * Reset the select quantity to 1
 */
export const showProductDetailDrawer = createAsyncThunk(
  'ordering/menu/productDetail/showProductDetailDrawer',
  async ({ productId, categoryId }, { dispatch, getState }) => {
    const state = getState();
    const shouldShowProductDetailDrawer = getShouldShowProductDetailDrawer(state);

    if (shouldShowProductDetailDrawer) {
      // Immediately clean up the selected product item info to avoid duplicate dispatch thunks
      await dispatch(cleanUpSelectedProductItemInfoIfNeeded());

      try {
        const result = await dispatch(appActions.loadProductDetail(productId));
        const productInResult = _get(result, 'responseGql.data.product', null);
        const isProductDetailRequestFailed = getIsProductDetailRequestRejected(getState());

        if (isProductDetailRequestFailed) {
          const productDetailErrorCategory = getProductDetailErrorCategory(getState());
          throw new ApiFetchError('Failed to load product detail', { category: productDetailErrorCategory });
        }

        gtmEventTracking(GTM_TRACKING_EVENTS.VIEW_PRODUCT, getViewProductGTMData(productInResult));

        return {
          productId,
          categoryId,
          selectedOptionsByVariationId: getDefaultSelectedOptions(productInResult),
        };
      } catch (error) {
        toast.error(i18next.t('ApiError:NoInternetConnection'));
        logger.error(
          'Ordering_Menu_ShowProductDetailDrawerFailed',
          { message: error?.message },
          {
            bizFlow: {
              step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
              flow: KEY_EVENTS_FLOWS.SELECTION,
            },
            errorCategory: error?.name,
          }
        );

        throw error;
      }
    }

    // If product detail drawer cannot be shown, pop up responding drawer
    // This only happens on delivery & pickup shipping types
    const isPickUpType = getIsPickUpType(state);
    const hasLocationSelected = getIfAddressInfoExists(state);
    const hasStoreBranchSelected = getHasSelectedStore(state);
    const hasTimeSlotSelected = getHasSelectedExpectedDeliveryTime(state);

    try {
      if (!(isPickUpType || hasLocationSelected)) {
        await dispatch(showLocationConfirmModal());
        throw new Error('No location selected');
      }

      if (!hasStoreBranchSelected) {
        await dispatch(showStoreListDrawer());
        throw new Error('No store branch selected');
      }

      if (!hasTimeSlotSelected) {
        await dispatch(showTimeSlotDrawer());
        throw new Error('No time slot selected');
      }

      // No one should be able to reach here, but if they do, it indicates that we miss some other conditions.
      throw new Error('Unknown reason');
    } catch (error) {
      await dispatch(saveSelectedProductItemInfo({ productId, categoryId }));
      logger.log(
        'Ordering_Menu_ShowProductDetailDrawerFailed',
        { message: error?.message },
        {
          bizFlow: {
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].VIEW_PRODUCTS,
            flow: KEY_EVENTS_FLOWS.SELECTION,
          },
        }
      );
      throw error;
    }
  }
);

/**
 * hide product detail drawer
 */
export const hideProductDetailDrawer = createAsyncThunk(
  'ordering/menu/productDetail/hideProductDetailDrawer',
  async () => {}
);

export const productDetailDrawerShown = createAsyncThunk(
  'ordering/menu/productDetail/productDetailDrawerShown',
  async (_, { getState }) => {
    const state = getState();
    const product = getSelectedProduct(state);
    const category = getSelectedCategory(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(state);
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Menu Page - View products', {
      ...storeInfoForCleverTap,
      ...productCleverTapAttributes,
    });
  }
);

export const productDetailDrawerHidden = createAsyncThunk(
  'ordering/menu/productDetail/productDetailDrawerHidden',
  async (_, { dispatch }) => {
    dispatch(resetTakeawayOptionCheckState());
  }
);

export const productItemClicked = createAsyncThunk(
  'ordering/menu/productDetail/productItemClicked',
  async ({ productId, categoryId }, { dispatch, getState }) => {
    const state = getState();
    const allProducts = getAllProducts(state);
    const allCategories = getAllCategories(state);
    const product = _get(allProducts, productId, null);
    const category = _get(allCategories, categoryId, null);
    const paymentInfoForCleverTap = getPaymentInfoForCleverTap(state);
    const storeInfoForCleverTap = getStoreInfoForCleverTap(state);
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);

    Clevertap.pushEvent('Menu Page - Click product', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
      ...productCleverTapAttributes,
    });

    await dispatch(showProductDetailDrawer({ productId, categoryId }));
  }
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
    const isTakeaway = getIsTakeawayProduct(state);
    const product = getSelectedProduct(getState());
    const category = getSelectedCategory(getState());
    const paymentInfoForCleverTap = getPaymentInfoForCleverTap(getState());
    const storeInfoForCleverTap = getStoreInfoForCleverTap(getState());
    const productCleverTapAttributes = getProductCleverTapAttributes(product, category);
    const foodTagsForCleverTap = getFoodTagsForCleverTap(getState());
    const addToCartGtmData = getAddToCartGTMData(state);
    const comments = getNotesContents(state);

    try {
      gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, addToCartGtmData);

      Clevertap.pushEvent('Menu Page - Add to Cart', {
        ...storeInfoForCleverTap,
        ...paymentInfoForCleverTap,
        ...productCleverTapAttributes,
        foodTags: foodTagsForCleverTap,
      });

      if (isEnablePayLater) {
        dispatch(
          updateCartItems({
            productId: childProductId || parentProductId,
            quantityChange: quantity,
            comments,
            variations,
            isTakeaway,
          })
        );
      } else {
        await dispatch(
          appActions.addOrUpdateShoppingCartItem({
            action: 'add',
            business,
            productId: childProductId || parentProductId,
            quantity,
            comments,
            variations,
            isTakeaway,
          })
        );

        const isAddOrUpdateShoppingCartItemRejected = getIsAddOrUpdateShoppingCartItemRejected(getState());

        if (isAddOrUpdateShoppingCartItemRejected) {
          const addOrUpdateShoppingCartItemErrorCategory = getAddOrUpdateShoppingCartItemErrorCategory(getState());
          throw new ApiFetchError('Failed to add or update items to shopping cart', {
            category: addOrUpdateShoppingCartItemErrorCategory,
          });
        }
        await dispatch(appActions.loadShoppingCart());
      }
      dispatch(hideProductDetailDrawer());
    } catch (error) {
      dispatch(hideProductDetailDrawer());
      logger.error(
        'Ordering_Menu_AddToCartFailed',
        {
          message: error?.message,
        },
        {
          bizFLow: {
            flow: KEY_EVENTS_FLOWS.SELECTION,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.SELECTION].ADD_TO_CART,
          },
          errorCategory: error?.name,
        }
      );
      throw error;
    }
  }
);

export const showNotesDrawer = createAsyncThunk('ordering/menu/productDetail/showNotesDrawer', async () => {});
export const hideNotesDrawer = createAsyncThunk('ordering/menu/productDetail/hideNotesDrawer', async () => {});
