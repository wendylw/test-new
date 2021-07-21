import _get from 'lodash/get';
import * as StoreUtils from '../../../utils/store-utils';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { actions as appActions, getBusiness } from './app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { createSelector } from 'reselect';
import { getAllCategories } from '../../../redux/modules/entities/categories';

export const initialState = {
  selectedProductDetail: {
    categoryId: null,
    productId: null,
  },
};

const types = {
  SHOW_PRODUCT_DETAIL: 'ORDERING/HOME/SHOW_PRODUCT_DETAIL',
};

// actions
export const actions = {
  showProductDetail: (productId, categoryId) => async dispatch => {
    await dispatch(appActions.loadProductDetail(productId));

    dispatch({
      type: types.SHOW_PRODUCT_DETAIL,
      payload: {
        categoryId,
        productId,
      },
    });
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SHOW_PRODUCT_DETAIL:
      return {
        ...state,
        selectedProductDetail: {
          ...state.selectedProductDetail,
          categoryId: action.payload.categoryId,
          productId: action.payload.productId,
        },
      };
    default:
      return state;
  }
};

export default reducer;

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getStoreInfoForCleverTap = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);

  return StoreUtils.getStoreInfoForCleverTap({ business, allBusinessInfo });
};

export const getSelectedProductId = state => state.home.selectedProductDetail.productId;

export const getSelectedCategoryId = state => state.home.selectedProductDetail.categoryId;

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
