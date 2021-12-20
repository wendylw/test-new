import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getAllCategories } from '../../../../../redux/modules/entities/categories';
import { getAllProducts } from '../../../../../redux/modules/entities/products';
import { getBusinessInfo, getDeliveryInfo } from '../../../../redux/modules/app';
import { ALCOHOL_FREE_COUNTRY_LIST } from './constants';

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
  getBusinessInfo,
  businessInfo => !ALCOHOL_FREE_COUNTRY_LIST.includes(businessInfo)
);

export const getUserHasReachedLegalDrinkingAge = state => !!state.home.common.alcoholConsent.data;

export const getAlcoholModalDisplayResult = createSelector(
  getDeliveryHasAlcohol,
  getCountryHasDrinkingAgeRestriction,
  getUserHasReachedLegalDrinkingAge,
  (hasAlcohol, hasDrinkingAgeRestriction, hasReachedLegalDrinkingAge) =>
    hasAlcohol && hasDrinkingAgeRestriction && !hasReachedLegalDrinkingAge
);
