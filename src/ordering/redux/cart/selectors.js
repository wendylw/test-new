import { createSelector } from 'reselect';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { CART_SUBMISSION_STATUS, CART_STATUS } from './constants';
import { API_REQUEST_STATUS } from '../../../utils/api/api-utils';

export const getCartVersion = state => state.app.cart.version;

export const getCartSource = state => state.app.cart.source;

export const getCartItemsCount = state => state.app.cart.count;

const getOriginalCartItems = state => state.app.cart.items;

export const getCartItems = createSelector(
  [getOriginalCartItems, getAllProducts, getAllCategories],
  (items, allProducts, categories) => {
    const categoriesKeys = Object.keys(categories) || [];
    const allProductIds = Object.keys(allProducts) || [];
    const categoryInfo = currentCartItem => {
      let categoryName = '';
      let categoryRank = '';

      categoriesKeys.forEach((key, index) => {
        if ((categories[key].products || []).find(productId => productId === currentCartItem.productId)) {
          categoryName = categories[key].name;
          categoryRank = index + 1;
        }
      });

      return {
        categoryName,
        categoryRank,
      };
    };

    return items.map(item => ({
      ...item,
      ...categoryInfo(item),
      rank: allProductIds.findIndex(id => id === item.productId) + 1,
      isFeaturedProduct:
        allProducts[item.productId] && allProducts[item.productId].isFeaturedProduct
          ? allProducts[item.productId].isFeaturedProduct
          : false,
    }));
  }
);

export const getOriginalCartUnavailableItems = state => state.app.cart.unavailableItems;

export const getCartUnavailableItems = createSelector(
  [getOriginalCartUnavailableItems, getAllProducts, getAllCategories],
  (unavailableItems, allProducts, categories) => {
    const categoriesKeys = Object.keys(categories) || [];
    const allProductIds = Object.keys(allProducts) || [];
    const categoryInfo = currentCartUnavailableItem => {
      let categoryName = '';
      let categoryRank = '';

      categoriesKeys.forEach((key, index) => {
        if ((categories[key].products || []).find(productId => productId === currentCartUnavailableItem.productId)) {
          categoryName = categories[key].name;
          categoryRank = index + 1;
        }
      });

      return {
        categoryName,
        categoryRank,
      };
    };

    return unavailableItems.map(unavailableItem => ({
      ...unavailableItem,
      ...categoryInfo(unavailableItem),
      rank: allProductIds.findIndex(id => id === unavailableItem.productId) + 1,
      isFeaturedProduct:
        allProducts[unavailableItem.productId] && allProducts[unavailableItem.productId].isFeaturedProduct
          ? allProducts[unavailableItem.productId].isFeaturedProduct
          : false,
    }));
  }
);

export const getCartSubmissionId = state => state.app.cart.submission.submissionId;

export const getCartSubmissionReceiptNumber = state => state.app.cart.submission.receiptNumber;

export const getCartSubmittedStatus = state =>
  state.app.cart.submission.status === CART_SUBMISSION_STATUS.COMPLETED ||
  state.app.cart.status === CART_STATUS.COMPLETED;

export const getCartSubmissionPendingStatus = state =>
  state.app.cart.submission.status === CART_SUBMISSION_STATUS.PENDING;

export const getCartSubmissionFailedStatus = state =>
  state.app.cart.submission.status === CART_SUBMISSION_STATUS.FAILED;

export const getCartStatusNotSubmitted = state => state.app.cart.status !== CART_STATUS.COMPLETED;

export const getCartQueryRequestingStatus = state =>
  state.app.cart.requestStatus.loadCart === API_REQUEST_STATUS.PENDING;

export const getCartNotSubmittedAndEmpty = createSelector(
  [getCartItems, getCartStatusNotSubmitted, getCartQueryRequestingStatus],
  (cartItems, cartNotSubmitted, cartQueryRequestingStatus) =>
    !cartItems.length && cartNotSubmitted && !cartQueryRequestingStatus
);

export const getCartSubmissionRequestingStatus = state =>
  state.app.cart.submission.requestStatus.submitCart === API_REQUEST_STATUS.PENDING;
