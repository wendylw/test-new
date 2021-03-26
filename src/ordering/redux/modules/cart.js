import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import config from '../../../config';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { CART_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getAllProducts, getProductById } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getBusinessUTCOffset, getCartItemList, fetchShoppingCart } from './app';
import { APP_TYPES } from '../types';

const initialState = {
  pendingTransactionsIds: [],
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
};

export const types = CART_TYPES;

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
  updateTransactionsStatus: ({ status, receiptNumbers }) => ({
    [API_REQUEST]: {
      types: [
        types.UPDATE_TRANSACTIONS_STATUS_REQUEST,
        types.UPDATE_TRANSACTIONS_STATUS_SUCCESS,
        types.UPDATE_TRANSACTIONS_STATUS_FAILURE,
      ],
      ...Url.API_URLS.PUT_TRANSACTIONS_STATUS,
      payload: {
        status,
        receiptNumbers,
      },
    },
  }),

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
};

const pendingTransactionsIds = (state = initialState.pendingTransactionsIds, action) => {
  const { transactions } = action.response || {};

  switch (action.type) {
    case types.FETCH_PENDING_TRANSACTIONS_SUCCESS:
      return { ...state, pendingTransactionsIds: (transactions || []).map(t => t.orderId) };
    case types.UPDATE_TRANSACTIONS_STATUS_SUCCESS:
      return { ...state, pendingTransactionsIds: [] };
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
  pendingTransactionsIds,
  selectedProduct,
});

export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getSelectedProductDetail = state => {
  const { selectedProduct } = state.cart;

  return getProductById(state, selectedProduct.id);
};

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
  (products, categories, carts) => {
    if (!products || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories)
      .map(category => {
        return {
          ...category,
          products: category.products.map(id => {
            const product = JSON.parse(JSON.stringify(products[id]));
            return {
              ...product,
            };
          }),
        };
      })
      .filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);

export const getAllProductsIds = createSelector(getAllProducts, allProducts => {
  try {
    const res = Object.keys(allProducts);
    return res;
  } catch (e) {
    return [];
  }
});

// selectors
