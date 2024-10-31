import { createSelector, createStructuredSelector } from 'reselect';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _forOwn from 'lodash/forOwn';
import _isArray from 'lodash/isArray';
import _isNumber from 'lodash/isNumber';
import _sumBy from 'lodash/sumBy';
import _isNil from 'lodash/isNil';
import { API_REQUEST_STATUS, PRODUCT_STOCK_STATUS } from '../../../../../../common/utils/constants';
import {
  getAllProducts,
  getFormatCurrencyFunction,
  getIsDineType,
  getIsTakeawayType,
  getEnableTakeaway,
  getTakeawayCharge,
  getIsBeepQRDemo,
} from '../../../../../redux/modules/app';
import {
  getIsProductListReady,
  getTimeSlotDrawerVisible,
  getIsLocationDrawerVisible,
  getIsStoreListDrawerVisible,
  getHasSelectedProductItemInfo,
  getIsLocationConfirmModalVisible,
} from '../../common/selectors';
import { PRODUCT_UNABLE_ADD_TO_CART_REASONS, PRODUCT_VARIATION_TYPE } from '../../../constants';
import { variationStructuredSelector } from './variationSelector';
import { variationOptionStructuredSelector, formatVariationOptionPriceDiff } from './variationOptionSelector';
import { getAllCategories } from '../../../../../../redux/modules/entities/categories';
import { STOCK_STATUS_MAPPING } from '../../../../../../utils/gtm';

export { getTakeawayCharge } from '../../../../../redux/modules/app';

export const getProductDetailState = state => state.menu.productDetail;

export const getSelectedProductId = createSelector(getProductDetailState, state => state.selectedProductId);

export const getSelectedCategoryId = createSelector(getProductDetailState, state => state.selectedCategoryId);

export const getSelectedQuantity = createSelector(getProductDetailState, state => state.selectedQuantity);

export const getProductDetailRequestStatus = createSelector(
  getProductDetailState,
  state => state.productDetailRequest.status
);

export const getAddToCartRequestStatus = createSelector(getProductDetailState, state => state.addToCartRequest.status);

export const getIsAddToCartLoading = createSelector(
  getAddToCartRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

/**
 * is product detail drawer visible
 */
export const getIsProductDetailDrawerVisible = createSelector(
  getProductDetailState,
  state => state.isProductDetailDrawerVisible
);

export const getSelectedOptionsByVariationId = createSelector(
  getProductDetailState,
  state => state.selectedOptionsByVariationId
);

export const getLatestSelectedSingleChoiceVariationId = createSelector(
  getProductDetailState,
  state => state.latestSelectedSingleChoiceVariationId
);

export const getSelectedProduct = createSelector(
  getAllProducts,
  getSelectedProductId,
  (allProducts, selectedProductId) => allProducts[selectedProductId]
);

export const getSelectedCategory = createSelector(
  getAllCategories,
  getSelectedCategoryId,
  (allCategories, selectedCategoryId) => allCategories[selectedCategoryId]
);

export const getSelectedProductInventoryType = createSelector(getSelectedProduct, selectedProduct =>
  _get(selectedProduct, 'inventoryType', null)
);

export const getProductDisplayPrice = createSelector(getSelectedProduct, product => _get(product, 'displayPrice', 0));

export const getProductId = createSelector(getSelectedProduct, product => _get(product, 'id', ''));

export const getProductTitle = createSelector(getSelectedProduct, product => _get(product, 'title', ''));

export const getProductDescription = createSelector(getSelectedProduct, product => {
  const description = _get(product, 'description', '');
  // return empty string for default description '<p><br></p>'
  if (description === '<p><br></p>') {
    return '';
  }
  return description;
});

export const getProductImages = createSelector(getSelectedProduct, product => _get(product, 'images', []));

export const getProductChildrenMap = createSelector(getSelectedProduct, product => _get(product, 'childrenMap', []));

export const getProductFormattedDisplayPrice = createSelector(
  getProductDisplayPrice,
  getFormatCurrencyFunction,
  (displayPrice, formatCurrency) => formatCurrency(displayPrice, { hiddenCurrency: true })
);

export const getProductOriginalDisplayPrice = createSelector(getSelectedProduct, product =>
  _get(product, 'originalDisplayPrice', null)
);

export const getProductFormattedOriginalDisplayPrice = createSelector(
  getProductOriginalDisplayPrice,
  getFormatCurrencyFunction,
  (originalDisplayPrice, formatCurrency) => formatCurrency(originalDisplayPrice, { hiddenCurrency: true })
);

/**
 * possible values: "notTrackInventory" || "inStock" || "lowStock" || "outOfStock"
 */
export const getProductStockStatus = createSelector(getSelectedProduct, product =>
  _get(product, 'stockStatus', PRODUCT_STOCK_STATUS.NOT_TRACK_INVENTORY)
);

export const getProductQuantityOnHand = createSelector(
  getSelectedProduct,
  product => product?.quantityOnHand ?? Infinity
);

export const getProductIsBestSeller = createSelector(getSelectedProduct, product =>
  _get(product, 'isFeaturedProduct', false)
);

export const getProductVariations = createSelector(getSelectedProduct, product => _get(product, 'variations', []));

export const getSelectedSingleChoiceOptionsList = createSelector(
  getProductVariations,
  getSelectedOptionsByVariationId,
  (variations, selectedOptionsByVariationId) =>
    variations
      .filter(
        variation =>
          !variation.isModifier &&
          variation.variationType === 'SingleChoice' &&
          selectedOptionsByVariationId[variation.id]
      )
      .map(variation => {
        const selectedOption = selectedOptionsByVariationId[variation.id];

        return variation.optionValues.find(optionValue => optionValue.id === selectedOption.optionId);
      })
);

export const getSelectedSingleChoiceOptionValuesSet = createSelector(
  getSelectedSingleChoiceOptionsList,
  optionsList => new Set(optionsList.map(option => option.value))
);

export const getSelectedChildProduct = createSelector(
  getProductChildrenMap,
  getSelectedSingleChoiceOptionValuesSet,
  (childrenMap, SingleChoiceOptionValuesSet) =>
    childrenMap.find(child => _isEqual(new Set(child.variation), SingleChoiceOptionValuesSet))
);

export const getHasChildProduct = createSelector(getSelectedChildProduct, childProduct => !!childProduct);

export const getSelectedChildProductId = createSelector(getSelectedChildProduct, childProduct =>
  _get(childProduct, 'childId', null)
);

export const getSelectedChildProductStockStatus = createSelector(getSelectedChildProduct, childProduct =>
  _get(childProduct, 'stockStatus', null)
);

export const getSelectedChildProductQuantityOnHand = createSelector(getSelectedChildProduct, childProduct =>
  _get(childProduct, 'quantityOnHand', null)
);

export const getSelectedChildProductDisplayPrice = createSelector(getSelectedChildProduct, childProduct =>
  _get(childProduct, 'displayPrice', null)
);

export const getSelectedChildProductOriginalDisplayPrice = createSelector(getSelectedChildProduct, childProduct =>
  _get(childProduct, 'originalDisplayPrice', null)
);

export const getSelectedVariationDataForAddToCartApi = createSelector(
  getSelectedOptionsByVariationId,
  selectedOptionsByVariationId => {
    const selectedVariationData = [];

    _forOwn(selectedOptionsByVariationId, (selectedOptions, variationId) => {
      // for multiple choice
      if (_isArray(selectedOptions)) {
        selectedOptions.forEach(selectedOption => {
          if (_isNumber(selectedOption.quantity) && selectedOption.quantity <= 0) {
            return;
          }

          selectedVariationData.push({
            variationId,
            optionId: selectedOption.optionId,
            quantity: selectedOption.quantity ?? 1,
          });
        });
      } else {
        // for single choice
        selectedVariationData.push({
          variationId,
          optionId: selectedOptions.optionId,
          quantity: 1,
        });
      }
    });

    return selectedVariationData;
  }
);

export const getProductVariationsDetail = createSelector(
  getProductVariations,
  getSelectedOptionsByVariationId,
  getProductChildrenMap,
  getLatestSelectedSingleChoiceVariationId,
  getFormatCurrencyFunction,
  (
    variations,
    selectedOptionsByVariationId,
    productChildrenMap,
    latestSelectedSingleChoiceVariationId,
    formatCurrency
  ) =>
    variations.map(variation => {
      const variationDetail = variationStructuredSelector(variation, selectedOptionsByVariationId);
      const optionsDetail = variation.optionValues.map(optionValue =>
        variationOptionStructuredSelector(
          optionValue,
          variationDetail,
          selectedOptionsByVariationId,
          productChildrenMap,
          latestSelectedSingleChoiceVariationId,
          formatCurrency
        )
      );
      const selectedOptions = optionsDetail.filter(option => option.selected);

      const totalPriceDiff = _sumBy(selectedOptions, option => option.priceDiff * option.quantity);

      return {
        ...variationDetail,
        options: optionsDetail,
        priceDiff: totalPriceDiff,
        formattedPriceDiff: formatVariationOptionPriceDiff(totalPriceDiff, formatCurrency),
      };
    })
);

export const getIsProductVariationFulfilled = createSelector(getProductVariationsDetail, variations =>
  variations.map(v => v.selectionAmountLimit.fulfilled).every(fulfilled => fulfilled)
);

/**
 * Beep QR Takeaway from Table QR
 */
export const getHasExtraTakeawayCharge = createSelector(getTakeawayCharge, takeawayCharge => takeawayCharge > 0);

export const getIsTakeawayOptionChecked = createSelector(getProductDetailState, state => state.isTakeawayOptionChecked);

export const getFormattedTakeawayCharge = createSelector(
  getTakeawayCharge,
  getFormatCurrencyFunction,
  (takeawayCharge, formatCurrency) =>
    _isNil(takeawayCharge) ? '' : formatCurrency(takeawayCharge, { hiddenCurrency: true })
);

export const getIsTakeawayVariantAvailable = createSelector(
  getIsDineType,
  getEnableTakeaway,
  (isDineType, enableTakeaway) => isDineType && enableTakeaway
);

export const getShouldIncludeTakeawayCharge = createSelector(
  getHasExtraTakeawayCharge,
  getIsTakeawayOptionChecked,
  getIsTakeawayVariantAvailable,
  (hasExtraTakeawayCharge, isTakeawayOptionChecked, isTakeawayVariantAvailable) =>
    isTakeawayVariantAvailable && isTakeawayOptionChecked && hasExtraTakeawayCharge
);

// WB-5784: This is for the backward compatibility sake,
// If the shipping type is takeaway, `isTakeaway` should always be true.
export const getIsTakeawayProduct = createSelector(
  getIsTakeawayType,
  getIsTakeawayOptionChecked,
  (isTakeawayType, isTakeawayOptionChecked) => isTakeawayType || isTakeawayOptionChecked
);

/**
 * is product detail ready
 */
export const getIsProductDetailLoading = createSelector(
  getProductDetailRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getAllSelectedOptionsTotalPriceDiff = createSelector(getProductVariationsDetail, variations =>
  _sumBy(variations, 'priceDiff')
);

export const getMultipleSelectedOptionsTotalPriceDiff = createSelector(getProductVariationsDetail, variations => {
  const multipleVariations = variations.filter(({ type }) => type !== PRODUCT_VARIATION_TYPE.SINGLE_CHOICE);
  return _sumBy(multipleVariations, 'priceDiff');
});

export const getSingleSelectedOptionsNotChildMapTotalPriceDiff = createSelector(
  getProductVariationsDetail,
  variations => {
    const shareModifierSingleVariations = variations.filter(
      ({ isModifier, type }) => isModifier && type === PRODUCT_VARIATION_TYPE.SINGLE_CHOICE
    );
    return _sumBy(shareModifierSingleVariations, 'priceDiff');
  }
);

export const getSelectedOptionsTotalPriceDiff = createSelector(
  getTakeawayCharge,
  getHasChildProduct,
  getShouldIncludeTakeawayCharge,
  getAllSelectedOptionsTotalPriceDiff,
  getMultipleSelectedOptionsTotalPriceDiff,
  getSingleSelectedOptionsNotChildMapTotalPriceDiff,
  (
    takeawayCharge,
    hasChildProduct,
    shouldIncludeTakeawayCharge,
    allSelectedOptionsPriceDiff,
    multipleSelectedOptionsTotalPriceDiff,
    singleSelectedOptionsNotChildMapTotalPriceDiff
  ) => {
    const getProductOptionsPriceDiff = () => {
      // if has child product, exclude the price diff of single choice options
      if (hasChildProduct) {
        return multipleSelectedOptionsTotalPriceDiff + singleSelectedOptionsNotChildMapTotalPriceDiff;
      }
      return allSelectedOptionsPriceDiff;
    };

    const productOptionsPriceDiff = getProductOptionsPriceDiff();

    if (shouldIncludeTakeawayCharge) {
      return productOptionsPriceDiff + takeawayCharge;
    }

    return productOptionsPriceDiff;
  }
);

export const getSelectedProductDisplayPrice = createSelector(
  getProductDisplayPrice,
  getSelectedChildProductDisplayPrice,
  (productDisplayPrice, childProductDisplayPrice) => childProductDisplayPrice ?? productDisplayPrice
);

export const getSelectedProductOriginalDisplayPrice = createSelector(
  getProductOriginalDisplayPrice,
  getSelectedChildProductOriginalDisplayPrice,
  (productOriginalDisplayPrice, childProductOriginalDisplayPrice) =>
    childProductOriginalDisplayPrice ?? productOriginalDisplayPrice
);

export const getProductDisplayPriceWithPriceDiff = createSelector(
  getSelectedProductDisplayPrice,
  getSelectedOptionsTotalPriceDiff,
  (displayPrice, totalPriceDiff) => displayPrice + totalPriceDiff
);

export const getProductFormattedDisplayPriceWithPriceDiff = createSelector(
  getProductDisplayPriceWithPriceDiff,
  getFormatCurrencyFunction,
  (price, formatCurrency) => formatCurrency(price, { hiddenCurrency: true })
);

export const getProductOriginalDisplayPriceWithPriceDiff = createSelector(
  getSelectedProductOriginalDisplayPrice,
  getSelectedOptionsTotalPriceDiff,
  (originalDisplayPrice, totalPriceDiff) => (originalDisplayPrice ? originalDisplayPrice + totalPriceDiff : null)
);

export const getProductFormattedOriginalDisplayPriceWithPriceDiff = createSelector(
  getProductOriginalDisplayPriceWithPriceDiff,
  getFormatCurrencyFunction,
  (price, formatCurrency) => (_isNil(price) ? '' : formatCurrency(price, { hiddenCurrency: true }))
);

export const getSelectedProductStockStatus = createSelector(
  getProductStockStatus,
  getSelectedChildProductStockStatus,
  (stockStatus, childProductStockStatus) => childProductStockStatus ?? stockStatus
);

export const getSelectedProductQuantityOnHand = createSelector(
  getProductQuantityOnHand,
  getSelectedChildProductQuantityOnHand,
  (quantityOnHand, childProductQuantityOnHand) => childProductQuantityOnHand ?? quantityOnHand
);

export const getTotalPrice = createSelector(
  getProductDisplayPriceWithPriceDiff,
  getSelectedQuantity,
  (displayPrice, selectedQuantity) => displayPrice * selectedQuantity
);

export const getFormattedTotalPrice = createSelector(
  getTotalPrice,
  getFormatCurrencyFunction,
  (totalPrice, formatCurrency) => formatCurrency(totalPrice)
);

export const getIsAbleToDecreaseQuantity = createSelector(getSelectedQuantity, quantity => quantity > 1);

export const getIsAbleToIncreaseQuantity = createSelector(
  getSelectedQuantity,
  getSelectedProductQuantityOnHand,
  (quantity, quantityOnHand) => quantity < quantityOnHand
);

export const getIsExceededQuantityOnHand = createSelector(
  getSelectedQuantity,
  getSelectedProductQuantityOnHand,
  (quantity, quantityOnHand) => quantity > quantityOnHand
);

export const getProductDetailData = createStructuredSelector({
  id: getProductId,
  title: getProductTitle,
  description: getProductDescription,
  images: getProductImages,
  formattedDisplayPrice: getProductFormattedDisplayPriceWithPriceDiff,
  formattedOriginalDisplayPrice: getProductFormattedOriginalDisplayPriceWithPriceDiff,
  stockStatus: getSelectedProductStockStatus,
  quantityOnHand: getSelectedProductQuantityOnHand,
  isBestSeller: getProductIsBestSeller,
  isAbleToDecreaseQuantity: getIsAbleToDecreaseQuantity,
  isAbleToIncreaseQuantity: getIsAbleToIncreaseQuantity,
  variations: getProductVariationsDetail,
});

export const getIsProductDetailDrawerFullScreen = createSelector(
  getProductImages,
  getProductVariationsDetail,
  (images, variations) => images.length > 0 || variations.length > 0
);

export const getIsOutOfStockProduct = createSelector(
  getSelectedProductStockStatus,
  selectedProductStockStatus => selectedProductStockStatus === PRODUCT_STOCK_STATUS.OUT_OF_STOCK
);

export const getIsUnavailableProduct = createSelector(
  getSelectedProduct,
  selectedProduct => !_get(selectedProduct, '_exists', false)
);

export const getIsAbleAddToCart = createSelector(
  getIsOutOfStockProduct,
  getIsUnavailableProduct,
  getIsExceededQuantityOnHand,
  getIsProductVariationFulfilled,
  getIsBeepQRDemo,
  (isOutOfStockProduct, isUnavailableProduct, isExceededQuantityOnHand, isProductVariationFulfilled, isBeepQRDemo) =>
    isProductVariationFulfilled &&
    !(isOutOfStockProduct || isUnavailableProduct || isExceededQuantityOnHand) &&
    !isBeepQRDemo
);

export const getUnableAddToCartReason = createSelector(
  getIsOutOfStockProduct,
  getIsUnavailableProduct,
  getIsExceededQuantityOnHand,
  getIsProductVariationFulfilled,
  (isOutOfStockProduct, isUnavailableProduct, isExceededQuantityOnHand, isProductVariationFulfilled) => {
    if (isOutOfStockProduct) {
      return PRODUCT_UNABLE_ADD_TO_CART_REASONS.OUT_OF_STOCK;
    }

    if (isUnavailableProduct) {
      return PRODUCT_UNABLE_ADD_TO_CART_REASONS.UNAVAILABLE;
    }

    if (isExceededQuantityOnHand) {
      return PRODUCT_UNABLE_ADD_TO_CART_REASONS.EXCEEDED_QUANTITY_ON_HAND;
    }

    if (!isProductVariationFulfilled) {
      return PRODUCT_UNABLE_ADD_TO_CART_REASONS.VARIATION_UNFULFILLED;
    }

    return '';
  }
);

export const getProductIdForGTMData = createSelector(
  getSelectedChildProductId,
  getSelectedProductId,
  (childProductId, selectedProductId) => childProductId || selectedProductId
);

export const getStockStatusForGTMData = createSelector(getSelectedProductStockStatus, selectedProductStockStatus =>
  _get(STOCK_STATUS_MAPPING, selectedProductStockStatus, STOCK_STATUS_MAPPING.inStock)
);

export const getProductImagesCount = createSelector(getProductImages, productImages => productImages.length);

export const getSelectedProductQuantityOnHandForGTMData = createSelector(
  getSelectedProductQuantityOnHand,
  quantityOnHand => (quantityOnHand === Infinity ? null : quantityOnHand)
);

export const getAddToCartGTMData = createStructuredSelector({
  product_name: getProductTitle,
  product_id: getProductIdForGTMData,
  price_local: getProductDisplayPriceWithPriceDiff,
  variant: getSelectedVariationDataForAddToCartApi,
  quantity: getSelectedProductQuantityOnHandForGTMData,
  product_type: getSelectedProductInventoryType,
  Inventory: getStockStatusForGTMData,
  image_count: getProductImagesCount,
});

export const getIfHasNotesContents = state => !!state.menu.productDetail.comments;

export const getNotesContents = state => state?.menu.productDetail.comments;

export const getIfCommentsShowStatus = state => state.menu.productDetail.showComments;

export const getShouldShowProductVariations = createSelector(
  getProductDetailData,
  productDetailData => productDetailData.variations.length > 0
);

export const getCouldShowProductDetailDrawer = createSelector(
  getIsProductListReady,
  getTimeSlotDrawerVisible,
  getIsLocationDrawerVisible,
  getIsStoreListDrawerVisible,
  getHasSelectedProductItemInfo,
  getIsLocationConfirmModalVisible,
  (
    isProductListReady,
    isTimeSlotDrawerVisible,
    isLocationDrawerVisible,
    isStoreListDrawerVisible,
    hasSelectedProductItemInfo,
    isLocationConfirmModalVisible
  ) => {
    // Only dispatch showProductDetailDrawer thunk when:
    // 1. Product list data is ready
    // 2. The selectedProductItemInfo exists
    // 3. Location confirm modal is not visible
    // 4. No drawer is visible now
    const isAnyDrawerVisible = isTimeSlotDrawerVisible || isLocationDrawerVisible || isStoreListDrawerVisible;
    return isProductListReady && hasSelectedProductItemInfo && !(isAnyDrawerVisible || isLocationConfirmModalVisible);
  }
);
