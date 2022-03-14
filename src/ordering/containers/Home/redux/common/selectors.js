import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getAllCategories } from '../../../../../redux/modules/entities/categories';
import { getAllProducts } from '../../../../../redux/modules/entities/products';
import {
  getMerchantCountry,
  getDeliveryInfo,
  getIsWebview,
  getUserIsLogin,
  getIsDeliveryOrder,
  getUserLoginByBeepAppStatus,
} from '../../../../redux/modules/app';
import { ALCOHOL_FREE_COUNTRY_LIST } from './constants';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import * as NativeMethods from '../../../../../utils/native-methods';

export const getSelectedProductId = state => state.home.common.selectedProductDetail.productId;

export const getSelectedCategoryId = state => state.home.common.selectedProductDetail.categoryId;

export const getSelectedProduct = createSelector(getSelectedProductId, getAllProducts, (productId, products) =>
  _get(products, productId, null)
);

export const getSelectedCategory = createSelector(getSelectedCategoryId, getAllCategories, (categoryId, categories) =>
  _get(categories, categoryId, null)
);

export const getSelectedProductDetail = createSelector(getSelectedProduct, getSelectedCategory, (product, category) => {
  if (!product) {
    return null;
  }

  return {
    ...product,
    categoryName: _get(category, 'name', null),
    categoryRank: _get(category, 'rank', null),
  };
});

export const getDeliveryHasAlcohol = createSelector(
  getDeliveryInfo,
  deliveryInfo => !!(deliveryInfo && deliveryInfo.sellAlcohol)
);

export const getCountryHasDrinkingAgeRestriction = createSelector(
  getMerchantCountry,
  country => !ALCOHOL_FREE_COUNTRY_LIST.includes(country)
);

export const getUserAlcoholConsent = state => state.home.common.alcoholConsent;

export const getUserHasReachedLegalDrinkingAge = createSelector(
  getUserAlcoholConsent,
  alcoholConsent => !!alcoholConsent.data
);

export const getHasUserAlcoholConsentRequestFulfilled = createSelector(
  getUserAlcoholConsent,
  alcoholConsent => alcoholConsent.status === API_REQUEST_STATUS.FULFILLED
);

export const getShouldShowAlcoholModal = createSelector(
  getDeliveryHasAlcohol,
  getCountryHasDrinkingAgeRestriction,
  getUserHasReachedLegalDrinkingAge,
  getHasUserAlcoholConsentRequestFulfilled,
  (hasAlcohol, hasDrinkingAgeRestriction, hasReachedLegalDrinkingAge, hasRequestFulfilled) =>
    hasAlcohol && hasDrinkingAgeRestriction && hasRequestFulfilled && !hasReachedLegalDrinkingAge
);

export const getHasSaveFavoriteStoreSupport = () => {
  const { BEEP_MODULE_METHODS } = NativeMethods;
  return NativeMethods.hasMethodInNative(BEEP_MODULE_METHODS.HAS_SAVE_FAVORITE_STORE_SUPPORT);
};

export const getShouldShowFavoriteButton = createSelector(
  getIsWebview,
  getIsDeliveryOrder,
  getHasSaveFavoriteStoreSupport,
  (isWebview, isDeliveryOrder, hasSaveFavoriteStoreSupport) =>
    isWebview && isDeliveryOrder && hasSaveFavoriteStoreSupport
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

export const getHasUserSaveStore = state => state.home.common.storeSaveStatus.data;
