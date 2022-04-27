import { createSelector } from '@reduxjs/toolkit';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import _sumBy from 'lodash/sumBy';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { getCartQuantityByProductId } from '../cart/selectors';
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
  getBusiness,
  getIsStoreInfoReady,
} from '../../../../redux/modules/app';

export { getTableId, getShippingType, getIsQrOrderingShippingType, getIsEnablePayLater, getIsStoreInfoReady };

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
            isSoldOut: ['outOfStock', 'unavailable'].includes(product.stockStatus),
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

export const getIsMenuRevamp = createSelector(
  getIsQrOrderingShippingType,
  isQrOrderingShippingType => isQrOrderingShippingType
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
          const keywordRegex = new RegExp(keyword, 'i');

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
