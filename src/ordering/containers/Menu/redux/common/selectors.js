import { createSelector } from '@reduxjs/toolkit';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import _sumBy from 'lodash/sumBy';
import _map from 'lodash/map';
import _escapeRegExp from 'lodash/escapeRegExp';
import {
  API_REQUEST_STATUS,
  SHIPPING_TYPES,
  PRODUCT_STOCK_STATUS,
  TIME_SLOT,
} from '../../../../../common/utils/constants';
import { getOpeningHours } from '../../../../../common/utils/index';
import { getCartQuantity, getCartQuantityByProductId, getIsFulfillMinimumConsumption } from '../cart/selectors';
import {
  getTableId,
  getCashbackRate,
  getBusinessInfo,
  getOnlineStoreInfo,
  getCategoryList,
  getOnlineCategoryStatus,
  getAllProducts,
  getFormatCurrencyFunction,
  getShippingType,
  getIsQrOrderingShippingType,
  getEnablePayLater as getIsEnablePayLater,
  getIsStoreInfoReady,
  getIsDeliveryOrder,
  getIsBeepDeliveryShippingType,
  getIsDeliveryType,
  getStore,
  getIsEnablePauseMode,
  getBusinessUTCOffset,
  getIsWebview,
  getUserLoginByBeepAppStatus,
  getUserIsLogin,
  getStoreId,
  getStoresList,
  getStoreCoords,
  getShippingFee,
  getDeliveryRadius,
  getDeliveryInfo,
  getQROrderingSettings,
  getIsUserLoginRequestStatusInPending,
  getStoreRating,
  getIsFromBeepSite,
  getIsInAppOrMiniProgram,
  getIsFromFoodCourt,
  getIsPickUpType,
  getHasSelectedStore,
  getIsCoreBusinessAPIPending,
  getIsCoreBusinessAPICompleted,
} from '../../../../redux/modules/app';
import * as StoreUtils from '../../../../../utils/store-utils';
import * as NativeMethods from '../../../../../utils/native-methods';
import {
  getAddressCoords,
  getAddressName as getSelectedLocationDisplayName,
  getIfAddressInfoExists,
} from '../../../../../redux/modules/address/selectors';
import { STORE_OPENING_STATUS } from '../../constants';
import { computeStraightDistance } from '../../../../../utils/geoUtils';

export {
  getTableId,
  getShippingType,
  getIsQrOrderingShippingType,
  getIsDeliveryType,
  getIsEnablePayLater,
  getIsStoreInfoReady,
  getStore,
  getStoreId,
  getSelectedLocationDisplayName,
  getIsPickUpType,
  getIsCoreBusinessAPIPending,
};

/**
 * get store logo
 * @param {*} state
 * @returns store log
 */
export const getStoreLogo = createSelector(getOnlineStoreInfo, onlineStoreInfo => _get(onlineStoreInfo, 'logo', null));
/**
 * get store display title
 * @param {*} state
 * @returns store display title
 */
export const getStoreDisplayTitle = createSelector(getOnlineStoreInfo, onlineStoreInfo => {
  const storeBrandName = _get(onlineStoreInfo, 'beepBrandName', '');
  const onlineStoreName = _get(onlineStoreInfo, 'storeName', '');

  return storeBrandName || onlineStoreName;
});

/**
 * get store display sub-title
 * @param {*} state
 * @returns store display sub-title
 */
export const getStoreDisplaySubTitle = createSelector(getBusinessInfo, businessInfo => {
  const storeLocationName = _get(businessInfo, 'stores.0.beepStoreNameLocationSuffix', '');
  const storeName = _get(businessInfo, 'stores.0.name', '');

  return storeLocationName || storeName;
});

/**
 * get active category id
 * @param {*} state
 * @returns
 */
export const getActiveCategoryId = state => state.menu.common.activeCategoryId;

// is time slot drawer visible
export const getTimeSlotDrawerVisible = state => state.menu.common.timeSlotDrawerVisible;

/**
 * get store category list
 * @param {*} state
 * @return store category list
 */
export const getCategories = createSelector(
  getCategoryList,
  getActiveCategoryId,
  getCartQuantityByProductId,
  (categoryList, activeCategoryId, cartQuantityByProductId) =>
    categoryList.map(category => ({
      name: category.name,
      id: category.id,
      cartQuantity: _sumBy(category.products, productId => cartQuantityByProductId[productId] || 0),
      isBestSeller: category.isBestSeller || false,
      isActive: category.id === activeCategoryId,
    }))
);

export const getCurrentTime = state => state.menu.common.currentTime;

export const getCurrentDate = createSelector(getCurrentTime, currentTime => new Date(currentTime));

/**
 * get current time in business time zone
 * @returns Dayjs object
 */
export const getBusinessTimeZoneCurrentDayjs = createSelector(
  getCurrentTime,
  getBusinessUTCOffset,
  (currentTime, businessUTCOffset) => StoreUtils.getBusinessDateTime(businessUTCOffset, currentTime)
);

export const getExpectedDeliveryTime = state => state.menu.common.expectedDeliveryTime;

export const getHasSelectedExpectedDeliveryTime = createSelector(
  getExpectedDeliveryTime,
  expectedDeliveryTime => !!expectedDeliveryTime
);

/**
 * get products by category
 * @param {*} state
 * @return products by category
 */
export const getProductsByCategory = createSelector(
  getCategoryList,
  getAllProducts,
  getCartQuantityByProductId,
  getFormatCurrencyFunction,
  (categoryList, productsById, cartQuantityByProductId, formatCurrency) =>
    categoryList.map(category => ({
      id: category.id,
      name: category.name,
      isBestSeller: category.isBestSeller,
      products: category.products
        .filter(productId => !!productsById[productId])
        .map(productId => {
          const product = productsById[productId];

          return {
            id: product.id,
            title: product.title,
            description: product.descriptionPlainText || '',
            image: _get(product.images, '0', null),
            formattedDisplayPrice: formatCurrency(product.displayPrice, { hiddenCurrency: true }),
            formattedOriginalDisplayPrice: product.originalDisplayPrice
              ? formatCurrency(product.originalDisplayPrice, { hiddenCurrency: true })
              : '',
            isSoldOut: [PRODUCT_STOCK_STATUS.OUT_OF_STOCK, PRODUCT_STOCK_STATUS.UNAVAILABLE].includes(
              product.stockStatus
            ),
            cartQuantity: cartQuantityByProductId[product.id] || 0,
            isBestSeller: product.isFeaturedProduct,
          };
        }),
    }))
);

/**
 * get cashback percentage
 * @return cashback percentage, for example: 4
 */
export const getCashbackPercentage = createSelector(getCashbackRate, cashbackRate => {
  if (!cashbackRate) {
    return null;
  }

  return cashbackRate * 100;
});

/**
 * is product list data ready
 * @returns
 */
export const getIsProductListReady = createSelector(
  getOnlineCategoryStatus,
  onlineCategoryStatus => onlineCategoryStatus === API_REQUEST_STATUS.FULFILLED
);

export const getShouldShowStoreNameInNativeHeader = state => !state.menu.common.storeNameInView;

export const getCategoriesInView = state => state.menu.common.categoriesInView;

export const getFirstCategoryInView = createSelector(
  getCategories,
  getCategoriesInView,
  (categories, categoriesInView) => categories.find(category => categoriesInView[category.id] === true) || categories[0]
);

export const getHighlightedCategory = createSelector(
  getActiveCategoryId,
  getCategories,
  getFirstCategoryInView,
  (activeCategoryId, categories, firstCategoryInView) => {
    const activeCategory = activeCategoryId ? categories.find(category => category.id === activeCategoryId) : null;

    return activeCategory || firstCategoryInView;
  }
);

export const getIsSearchingBannerVisible = state => state.menu.common.searchingBannerVisible;

export const getSearchingProductKeywords = state => state.menu.common.searchingProductKeywords;

/**
 * get the filtered product list according to the keyword
 * @returns filtered products by category
 */
export const getSearchingProducts = createSelector(
  getProductsByCategory,
  getSearchingProductKeywords,
  (categoriesProductList, searchProductsKeywords) => {
    if (_isEmpty(searchProductsKeywords)) {
      return categoriesProductList;
    }

    // Divide the keyword into a keyword list according to the space, and each keyword in the array is used as a search keyword
    const searchProductsKeywordList = searchProductsKeywords.split(' ').filter(keyword => !!keyword);
    const searchingProductsResult = [];

    categoriesProductList.forEach(({ products, ...otherOptions }) => {
      // The name and description of the Product contains every words in the keyword list, which is the searched product
      const searchedProductList = products.filter(product =>
        searchProductsKeywordList.every(keyword => {
          const searchCheckingContent = [product.title];

          if (!_isEmpty(product.description)) {
            searchCheckingContent.push(product.description);
          }
          // title or description ignore case matching keywords
          const keywordRegex = new RegExp(_escapeRegExp(keyword), 'i');

          return searchCheckingContent.join(' ').match(keywordRegex);
        })
      );

      if (searchedProductList.length > 0) {
        searchingProductsResult.push({
          ...otherOptions,
          products: searchedProductList,
        });
      }
    });

    return searchingProductsResult;
  }
);

/**
 * get `true` when the search box is not empty, the search result is an empty product list
 * @returns
 */
export const getIsSearchingEmptyProducts = createSelector(
  getIsSearchingBannerVisible,
  getSearchingProductKeywords,
  getSearchingProducts,
  (isSearchingBannerVisible, searchingProductKeywords, searchingProductsResult) =>
    isSearchingBannerVisible && !_isEmpty(searchingProductKeywords) && searchingProductsResult.length <= 0
);

/**
 * get scrolling top position before starting to search
 * @returns scrolling top position, for example: 0
 */
export const getBeforeStartToSearchScrollTopPosition = state => state.menu.common.beforeStartToSearchScrollTopPosition;

/**
 * get `true` when the virtual keyboard is opened
 * @returns
 */
export const getIsVirtualKeyboardVisible = state => state.menu.common.virtualKeyboardVisible;

export const getIsCurrentTimeAvailablePlaceOnDemandOrder = createSelector(
  getStore,
  getCurrentTime,
  getBusinessUTCOffset,
  getShippingType,
  (store, currentTime, businessUTCOffset, shippingType) =>
    StoreUtils.isAvailableOnDemandOrderTime(store, new Date(currentTime), businessUTCOffset, shippingType)
);

export const getHasSaveFavoriteStoreSupport = createSelector(getIsWebview, isWebview => {
  if (!isWebview) return false;
  const { BEEP_MODULE_METHODS } = NativeMethods;
  return NativeMethods.hasMethodInNative(BEEP_MODULE_METHODS.HAS_SAVE_FAVORITE_STORE_SUPPORT);
});

export const getShouldShowFavoriteButton = createSelector(
  getIsDeliveryOrder,
  getHasSaveFavoriteStoreSupport,
  getStoreId,
  (isDeliveryOrder, hasSaveFavoriteStoreSupport, storeId) => isDeliveryOrder && hasSaveFavoriteStoreSupport && !!storeId
);

export const getHasUserLoginByBeepAppRequestFulfilled = createSelector(
  getUserLoginByBeepAppStatus,
  loginByBeepAppStatus => loginByBeepAppStatus === API_REQUEST_STATUS.FULFILLED
);

export const getShouldCheckSaveStoreStatus = createSelector(
  getUserIsLogin,
  getShouldShowFavoriteButton,
  getHasUserLoginByBeepAppRequestFulfilled,
  (isLogin, shouldShowFavoriteButton, hasBeepAppLoginRequestFulfilled) =>
    isLogin && !hasBeepAppLoginRequestFulfilled && shouldShowFavoriteButton
);

export const getHasUserSaveStore = state => state.menu.common.storeFavStatus.data;

export const getStoreFullDisplayTitle = createSelector(
  getStoreDisplayTitle,
  getStoreDisplaySubTitle,
  (title, subTitle) => `${title}${subTitle ? ` (${subTitle})` : ''}`
);

export const getIsShowBackButton = createSelector(
  getIsFromBeepSite,
  getIsFromFoodCourt,
  (isFromBeepSite, isFromFoodCourt) => isFromBeepSite || isFromFoodCourt
);

/**
 * user selected display date
 * @returns  "" | "Today" | "Tomorrow" | "Sun 09"
 */
export const getSelectedDateDisplayValue = createSelector(
  getExpectedDeliveryTime,
  getCurrentTime,
  getBusinessUTCOffset,
  (expectedDeliveryTime, currentTime, businessUTCOffset) => {
    if (!expectedDeliveryTime) {
      return '';
    }

    if (expectedDeliveryTime === TIME_SLOT.NOW) {
      return TIME_SLOT.TODAY;
    }

    const expectedDeliveryTimeDayjsObj = StoreUtils.getBusinessDateTime(
      businessUTCOffset,
      new Date(expectedDeliveryTime)
    );

    if (expectedDeliveryTimeDayjsObj.isSame(currentTime, 'day')) {
      return TIME_SLOT.TODAY;
    }

    const tomorrowDayjsObj = StoreUtils.getBusinessDateTime(businessUTCOffset, new Date(currentTime)).add(1, 'day');

    const isTomorrow = expectedDeliveryTimeDayjsObj.isSame(tomorrowDayjsObj, 'day');

    if (isTomorrow) {
      return TIME_SLOT.TOMORROW;
    }

    return expectedDeliveryTimeDayjsObj.format('ddd DD');
  }
);

/**
 * user selected display time
 * @returns "" | "Immediate" | "4:00PM - 5:00PM" | "4:00PM"
 */
export const getSelectedTimeDisplayValue = createSelector(
  getExpectedDeliveryTime,
  getShippingType,
  getBusinessUTCOffset,
  (expectedDeliveryTime, shippingType, businessUTCOffset) => {
    if (!expectedDeliveryTime) {
      return '';
    }

    if (expectedDeliveryTime === TIME_SLOT.NOW) {
      return 'Immediate';
    }

    const expectedDeliveryTimeDayjsObj = StoreUtils.getBusinessDateTime(
      businessUTCOffset,
      new Date(expectedDeliveryTime)
    );

    // for Delivery order, it will display a time period
    if (shippingType === SHIPPING_TYPES.DELIVERY) {
      const from = expectedDeliveryTimeDayjsObj.format('h:mmA');
      const to = expectedDeliveryTimeDayjsObj.add(1, 'hour').format('h:mmA');
      return `${from} - ${to}`;
    }

    return expectedDeliveryTimeDayjsObj.format('h:mmA');
  }
);

/**
 * Get selected Store opening status
 * @returns  "onDemand" | "preOrder" | "closed" | null
 */
export const getSelectedStoreStatus = createSelector(
  getStore,
  getShippingType,
  getBusinessUTCOffset,
  getCurrentTime,
  getIsEnablePauseMode,
  (store, shippingType, businessUTCOffset, currentTime, isEnabledPauseMode) => {
    if (!store) {
      return null;
    }

    if (isEnabledPauseMode) {
      return STORE_OPENING_STATUS.CLOSED;
    }

    const isAvailableOnDemand = StoreUtils.isAvailableOnDemandOrderTime(
      store,
      new Date(currentTime),
      businessUTCOffset,
      shippingType
    );

    if (isAvailableOnDemand) {
      return STORE_OPENING_STATUS.ON_DEMAND;
    }

    const isAvailablePreOrder = _get(store, 'qrOrderingSettings.enablePreOrder', false);

    if (isAvailablePreOrder) {
      return STORE_OPENING_STATUS.PRE_ORDER;
    }

    return STORE_OPENING_STATUS.CLOSED;
  }
);

/**
 * Get all Stores opening status
 * @returns  "onDemand" | "preOrder" | "closed" | null
 */
export const getAllStoresStatus = createSelector(
  getStoresList,
  getShippingType,
  getBusinessUTCOffset,
  getCurrentTime,
  (storeList, shippingType, businessUTCOffset, currentTime) => {
    if (storeList.length === 0) {
      return null;
    }

    const isEnabledPauseMode = storeList.every(store => _get(store, 'qrOrderingSettings.pauseModeEnabled', false));

    if (isEnabledPauseMode) {
      return STORE_OPENING_STATUS.CLOSED;
    }

    const isAvailableOnDemand = storeList.some(store =>
      StoreUtils.isAvailableOnDemandOrderTime(store, new Date(currentTime), businessUTCOffset, shippingType)
    );

    if (isAvailableOnDemand) {
      return STORE_OPENING_STATUS.ON_DEMAND;
    }

    const isAvailablePreOrder = storeList.some(store => _get(store, 'qrOrderingSettings.enablePreOrder', false));

    if (isAvailablePreOrder) {
      return STORE_OPENING_STATUS.PRE_ORDER;
    }

    return STORE_OPENING_STATUS.CLOSED;
  }
);

/**
 * Get Store opening status for display
 * @returns  "onDemand" | "preOrder" | "closed" | null
 */
export const getStoreStatus = createSelector(
  getSelectedStoreStatus,
  getAllStoresStatus,
  (selectedStoreStatus, allStoresStatus) => selectedStoreStatus || allStoresStatus
);

export const getDeliveryDistance = createSelector(
  getStoreCoords,
  getAddressCoords,
  getShippingType,
  (storeCoords, addressCoords, shippingType) => {
    if (shippingType !== SHIPPING_TYPES.DELIVERY) {
      return null;
    }

    if (!storeCoords || !addressCoords) {
      return null;
    }

    return computeStraightDistance(addressCoords, storeCoords);
  }
);

/**
 * get display delivery distance
 * @returns "~10.60 KM"
 */
export const getDisplayDeliveryDistance = createSelector(getDeliveryDistance, deliveryDistance => {
  if (!deliveryDistance) {
    return '';
  }

  return `~${(deliveryDistance / 1000).toFixed(2)} KM`;
});

/**
 * get formatted shipping fee
 * @returns "RM 24.00"
 */
export const getFormattedShippingFee = createSelector(
  getShippingFee,
  getShippingType,
  getFormatCurrencyFunction,
  getIfAddressInfoExists,
  (shippingFee, shippingType, formatCurrency, ifAddressInfoExists) => {
    if (shippingType !== SHIPPING_TYPES.DELIVERY || !ifAddressInfoExists) {
      return '';
    }

    return formatCurrency(shippingFee);
  }
);

/**
 * is selected address out of range
 */
export const getIsAddressOutOfRange = createSelector(
  getDeliveryDistance,
  getDeliveryRadius,
  (deliveryDistance, deliveryRadius) => {
    if (!deliveryDistance || !deliveryRadius) {
      return false;
    }

    return deliveryDistance / 1000 > deliveryRadius;
  }
);

/**
 * get store rating
 * Will be display it when entry is Beepit.com or Beep App or Beep TNG MP
 * @returns 4.8 | null
 */
export const getStoreRatingDisplayValue = createSelector(
  getStoreRating,
  getIsFromBeepSite,
  getIsBeepDeliveryShippingType,
  getIsInAppOrMiniProgram,
  (storeRating, isFromBeepSite, isBeepDeliveryShippingTye, isInAppOrMiniProgram) => {
    // store rating only display on the delivery or pickup order
    if (!isBeepDeliveryShippingTye) {
      return null;
    }

    // only from beep site or beep app or beep tng mp will display the store rating
    if (isFromBeepSite || isInAppOrMiniProgram) {
      return storeRating;
    }

    return null;
  }
);

/**
 * get is free delivery tag visible
 * @returns
 */
export const getIsFreeDeliveryTagVisible = createSelector(
  getDeliveryInfo,
  getStoreId,
  getShippingType,
  (deliveryInfo, storeId, shippingType) => {
    const { freeShippingMinAmount, enableConditionalFreeShipping } = deliveryInfo;

    return (
      storeId && shippingType === SHIPPING_TYPES.DELIVERY && freeShippingMinAmount && enableConditionalFreeShipping
    );
  }
);

/**
 * get the free shipping formatted mini amount
 * @returns "RM 0.00"
 */
export const getFreeShippingFormattedMinAmount = createSelector(
  getDeliveryInfo,
  getFormatCurrencyFunction,
  (deliveryInfo, formatCurrencyFunction) => {
    const { freeShippingMinAmount } = deliveryInfo;

    if (!freeShippingMinAmount) {
      return '';
    }

    return formatCurrencyFunction(freeShippingMinAmount);
  }
);

/**
 *  get the free shipping formatted mini amount with out spacing
 * @returns "RM0.00"
 */
export const getFreeShippingFormattedMinAmountWithOutSpacing = createSelector(
  getFreeShippingFormattedMinAmount,
  freeShippingFormattedMinAmount => freeShippingFormattedMinAmount.replace(/\s/g, '')
);

export const getIsTimeSlotAvailable = createSelector(getSelectedStoreStatus, storeStatus =>
  [STORE_OPENING_STATUS.ON_DEMAND, STORE_OPENING_STATUS.PRE_ORDER].includes(storeStatus)
);

export const getIsStoreInfoEntryVisible = createSelector(
  getStoreId,
  getIsDeliveryOrder,
  (storeId, isDeliveryOrder) => isDeliveryOrder && !!storeId
);

export const getIsStoreInfoDrawerVisible = state => state.menu.common.storeInfoDrawerVisible;

export const getIsLocationDrawerVisible = state => state.menu.common.locationDrawerVisible;
export const getIsStoreListDrawerVisible = state => state.menu.common.storeListDrawerVisible;

export const getIsLocationConfirmModalVisible = state => state.menu.common.locationConfirmModalVisible;

export const getStoreLocation = createSelector(getDeliveryInfo, deliveryInfo => {
  const { storeAddress } = deliveryInfo;
  return storeAddress;
});

/**
 * value includes: "" | "preOrder" | "closed"
 * @returns
 */
export const getStoreDisplayStatus = createSelector(getStoreStatus, storeStatus => {
  if (storeStatus === STORE_OPENING_STATUS.ON_DEMAND || !storeStatus) {
    return '';
  }

  if (storeStatus === STORE_OPENING_STATUS.PRE_ORDER) {
    return 'preOrder';
  }

  return 'closed';
});

export const getStoreContactNumber = createSelector(getDeliveryInfo, deliveryInfo => {
  const { telephone } = deliveryInfo;
  return telephone;
});

export const getStoreOpeningTimeList = createSelector(
  getQROrderingSettings,
  getStoreId,
  (qrOrderingSettings, storeId) => {
    if (!storeId) return [];

    const weekInfo = {
      1: 'Sunday',
      2: 'Monday',
      3: 'Tuesday',
      4: 'Wednesday',
      5: 'Thursday',
      6: 'Friday',
      7: 'Saturday',
    };
    const { validTimeFrom, validTimeTo, validDays, breakTimeFrom, breakTimeTo } = qrOrderingSettings;
    const openingHours = getOpeningHours({
      validTimeFrom,
      validTimeTo,
      breakTimeFrom,
      breakTimeTo,
    });

    return _map(weekInfo, (week, day) => ({
      day: week,
      openingHours,
      isClosed: !(openingHours.length > 0 && validDays.includes(+day)),
    }));
  }
);

/**
 *  is able to review cart, if cart empty that footer will be hidden
 * @return
 */
export const getIsAbleToReviewCart = createSelector(
  getIsEnablePayLater,
  getCartQuantity,
  getDeliveryInfo,
  getIsBeepDeliveryShippingType,
  getIsFulfillMinimumConsumption,
  getIsUserLoginRequestStatusInPending,
  getStoreStatus,
  (
    enablePayLater,
    cartQuantity,
    deliveryInfo,
    isBeepDeliveryShippingType,
    isFulfillMinimumConsumption,
    isUserLoginRequestStatusInPending,
    storeStatus
  ) => {
    const { enableLiveOnline } = deliveryInfo;
    const availableCartQuantity = cartQuantity > 0;

    if (enablePayLater) {
      return availableCartQuantity;
    }

    if (isBeepDeliveryShippingType && storeStatus === STORE_OPENING_STATUS.CLOSED) {
      return false;
    }

    return (
      availableCartQuantity && enableLiveOnline && !isUserLoginRequestStatusInPending && isFulfillMinimumConsumption
    );
  }
);

/**
 * for display store pickup location
 * @returns {string}
 */
export const getStoreLocationStreetForPickup = createSelector(getStore, getIsPickUpType, (store, isPickup) =>
  isPickup ? _get(store, 'street1', '') : ''
);

export const getSelectedProductItemInfo = state => state.menu.common.selectedProductItemInfo;

export const getHasSelectedProductItemInfo = createSelector(
  getSelectedProductItemInfo,
  selectedProductItemInfo => !!selectedProductItemInfo
);

export const getShouldShowProductDetailDrawer = createSelector(
  getIsQrOrderingShippingType,
  getIsPickUpType,
  getHasSelectedStore,
  getIfAddressInfoExists,
  getHasSelectedExpectedDeliveryTime,
  (isQrOrderingShippingType, isPickUpType, hasStoreBranchSelected, hasLocationSelected, hasTimeSlotSelected) => {
    if (isQrOrderingShippingType) {
      return true;
    }

    if (!(isPickUpType || hasLocationSelected)) {
      return false;
    }

    if (!hasStoreBranchSelected) {
      return false;
    }

    if (!hasTimeSlotSelected) {
      return false;
    }

    // For delivery/pick-up orders, we only show the product detail drawer after the user has selected the location, store branch, and time slot.
    return true;
  }
);

export const getShouldShowOfflineMenu = createSelector(
  getDeliveryInfo,
  getIsCoreBusinessAPICompleted,
  (deliveryInfo, isCoreBusinessAPICompleted) => {
    const { enableLiveOnline } = deliveryInfo;
    return isCoreBusinessAPICompleted && !enableLiveOnline;
  }
);
