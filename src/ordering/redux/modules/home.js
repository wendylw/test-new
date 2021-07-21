import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import * as StoreUtils from '../../../utils/store-utils';
import { combineReducers } from 'redux';
import { getProductById } from '../../../redux/modules/entities/products';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusiness, getBusinessUTCOffset } from './app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';

export const initialState = {
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
};

const types = {
  // fetch productDetail
  FETCH_PRODUCTDETAIL_REQUEST: 'ORDERING/HOME/FETCH_PRODUCTDETAIL_REQUEST',
  FETCH_PRODUCTDETAIL_SUCCESS: 'ORDERING/HOME/FETCH_PRODUCTDETAIL_SUCCESS',
  FETCH_PRODUCTDETAIL_FAILURE: 'ORDERING/HOME/FETCH_PRODUCTDETAIL_FAILURE',
};

const fetchProductDetail = variables => {
  const endpoint = Url.apiGql('ProductDetail');
  return {
    [FETCH_GRAPHQL]: {
      types: [types.FETCH_PRODUCTDETAIL_REQUEST, types.FETCH_PRODUCTDETAIL_SUCCESS, types.FETCH_PRODUCTDETAIL_FAILURE],
      endpoint,
      variables: {
        ...variables,
      },
    },
  };
};

// actions
export const actions = {
  loadProductDetail: prod => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    return dispatch(fetchProductDetail({ productId: prod.id, fulfillDate }));
  },
};

const selectedProduct = (state = initialState.selectedProduct, action) => {
  if (action.type === types.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true, status: 'pending' };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      status: 'fulfilled',
      id: product.id,
    };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false, status: 'reject' };
  }

  return state;
};

export default combineReducers({
  selectedProduct,
});

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getStoreInfoForCleverTap = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);

  return StoreUtils.getStoreInfoForCleverTap({ business, allBusinessInfo });
};

export const getSelectedProductDetail = state => {
  const { home, entities } = state;
  const { selectedProduct } = home;
  const { categories } = entities;
  const categoriesKeys = Object.keys(categories) || [];
  const selectedProductObject = getProductById(state, selectedProduct.id) || {};
  let categoryName = '';
  let categoryRank = '';

  categoriesKeys.forEach((key, index) => {
    if ((categories[key].products || []).find(productId => productId === selectedProductObject.id)) {
      categoryName = categories[key].name;
      categoryRank = index + 1;
    }
  });

  return Object.assign({}, selectedProductObject, {
    categoryName,
    categoryRank,
  });
};
