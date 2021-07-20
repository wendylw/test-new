import { createSelector } from 'reselect';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import * as StoreUtils from '../../../utils/store-utils';
import { combineReducers } from 'redux';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getAllProducts, getProductById } from '../../../redux/modules/entities/products';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { API_REQUEST } from '../../../redux/middlewares/api';
import config from '../../../config';
import { getBusiness, getBusinessUTCOffset, getCartItemList, fetchShoppingCart } from './app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { APP_TYPES } from '../types';

export const initialState = {
  domProperties: {
    // 33.8% equal (item padding + item image + item cart controller button height) / window width
    productItemMinHeight:
      ((document.body.clientWidth || window.innerWidth) && (document.body.clientWidth || window.innerWidth) < 170
        ? document.body.clientWidth || window.innerWidth
        : 414) * 0.26,
  },
  onlineCategory: {
    isFetching: false,
    categoryIds: [],
  },
  timeSlot: {
    timeSlotList: [],
  },
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
};

const types = {
  // fetch shoppingCart
  // FETCH_SHOPPINGCART_REQUEST: 'ORDERING/HOME/FETCH_SHOPPINGCART_REQUEST',
  // FETCH_SHOPPINGCART_SUCCESS: 'ORDERING/HOME/FETCH_SHOPPINGCART_SUCCESS',
  // FETCH_SHOPPINGCART_FAILURE: 'ORDERING/HOME/FETCH_SHOPPINGCART_FAILURE',

  // fetch onlineCategory
  FETCH_ONLINECATEGORY_REQUEST: 'ORDERING/HOME/FETCH_ONLINECATEGORY_REQUEST',
  FETCH_ONLINECATEGORY_SUCCESS: 'ORDERING/HOME/FETCH_ONLINECATEGORY_SUCCESS',
  FETCH_ONLINECATEGORY_FAILURE: 'ORDERING/HOME/FETCH_ONLINECATEGORY_FAILURE',

  // mutable addOrUpdateShoppingCartItem
  ADDORUPDATE_SHOPPINGCARTITEM_REQUEST: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_REQUEST',
  ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS',
  ADDORUPDATE_SHOPPINGCARTITEM_FAILURE: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_FAILURE',

  // - or + on home page product item
  DECREASE_PRODUCT_IN_CART: 'ORDERING/HOME/DECREASE_PRODUCT_IN_CART',
  INCREASE_PRODUCT_IN_CART: 'ORDERING/HOME/INCREASE_PRODUCT_IN_CART',

  SET_MENU_LAYOUT_TYPE: 'ORDERING/HOME/SET_MENU_TYPE',

  // time slot
  FETCH_TIMESLOT_REQUEST: 'ORDERING/HOME/FETCH_TIMESLOT_REQUEST',
  FETCH_TIMESLOT_SUCCESS: 'ORDERING/HOME/FETCH_TIMESLOT_SUCCESS',
  FETCH_TIMESLOT_FAILURE: 'ORDERING/HOME/FETCH_TIMESLOT_FAILURE',
};

const fetchOnlineCategory = variables => {
  const endpoint = Url.apiGql('OnlineCategory');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINECATEGORY_REQUEST,
        types.FETCH_ONLINECATEGORY_SUCCESS,
        types.FETCH_ONLINECATEGORY_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

// actions
export const actions = {
  // load product list group by category, and shopping cart
  loadProductList: () => (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    const businessUTCOffset = getBusinessUTCOffset(getState());

    let deliveryCoords;
    if (isDelivery) {
      deliveryCoords = Utils.getDeliveryCoords();
    }
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    config.storeId && dispatch(fetchShoppingCart(isDelivery, deliveryCoords, fulfillDate));

    const shippingType = Utils.getApiRequestShippingType();

    dispatch(fetchOnlineCategory({ fulfillDate, shippingType }));
  },

  getTimeSlot: (shippingType, fulfillDate, storeid) => dispatch => {
    return dispatch({
      [API_REQUEST]: {
        types: [types.FETCH_TIMESLOT_REQUEST, types.FETCH_TIMESLOT_SUCCESS, types.FETCH_TIMESLOT_FAILURE],
        ...Url.API_URLS.GET_TIME_SLOT(shippingType, fulfillDate, storeid),
      },
    });
  },
};

// reducers
const domProperties = (state = initialState.domProperties, action) => {
  return state;
};

const onlineCategory = (state = initialState.onlineCategory, action) => {
  switch (action.type) {
    case types.FETCH_ONLINECATEGORY_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ONLINECATEGORY_SUCCESS:
      const { onlineCategory } = action.responseGql.data;
      return {
        ...state,
        isFetching: false,
        categoryIds: onlineCategory.map(category => category.id),
      };
    case types.FETCH_ONLINECATEGORY_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const timeSlot = (state = initialState.timeSlot, action) => {
  switch (action.type) {
    case types.FETCH_TIMESLOT_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_TIMESLOT_SUCCESS:
      const timeSlotList = action.response;
      return {
        ...state,
        isFetching: false,
        timeSlotList,
      };
    case types.FETCH_TIMESLOT_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const selectedProduct = (state = initialState.selectedProduct, action) => {
  if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true, status: 'pending' };
  } else if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      status: 'fulfilled',
      id: product.id,
    };
  } else if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false, status: 'reject' };
  }

  return state;
};

export default combineReducers({
  domProperties,
  onlineCategory,
  timeSlot,
  selectedProduct,
});

export const getCategoryIds = state => state.home.onlineCategory.categoryIds;

const mergeWithShoppingCart = (onlineCategory, carts) => {
  if (!Array.isArray(onlineCategory)) {
    return null;
  }

  const shoppingCartNewSet = {};

  if (carts) {
    (carts || []).forEach(item => {
      const newItem = shoppingCartNewSet[item.parentProductId || item.productId] || {
        quantity: 0,
        ids: [],
        products: [],
      };

      newItem.quantity += item.quantity;
      newItem.ids.push(item.id);
      newItem.products.push(item);

      shoppingCartNewSet[item.parentProductId || item.productId] = newItem;
    });
  }

  return onlineCategory.map(category => {
    const { products } = category;

    category.cartQuantity = 0;

    products.forEach(function(product) {
      product.variations = product.variations || [];
      product.soldOut = Utils.isProductSoldOut(product || {});
      product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
      product.cartQuantity = 0;

      const result = shoppingCartNewSet[product.id];

      if (result) {
        category.cartQuantity += result.quantity;
        product.cartQuantity += result.quantity;
        product.cartItemIds = result.ids;
        product.cartItems = result.products;
        product.canDecreaseQuantity = result.quantity > 0 && result.ids.length === 1;
      }
    });

    return category;
  });
};

export const getCategoryProductList = createSelector(
  [getAllProducts, getAllCategories, getCartItemList],
  (allProducts, categories, carts) => {
    if (!allProducts || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories)
      .map((category, categoryId) => {
        return {
          ...category,
          products: category.products.map((id, index) => {
            const product = JSON.parse(JSON.stringify(allProducts[id]));

            return {
              categoryName: category.name,
              categoryRank: categoryId + 1,
              rank: index + 1,
              ...product,
            };
          }),
        };
      })
      .filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);

export const getProductItemMinHeight = state => state.home.domProperties.productItemMinHeight;

export const getTimeSlotList = state => state.home.timeSlot.timeSlotList;

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
