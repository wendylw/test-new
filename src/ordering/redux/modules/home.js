import { createSelector } from 'reselect';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';

import { combineReducers } from 'redux';
import { getCartSummary, getAllCartItems, getCartItemById } from '../../../redux/modules/entities/carts';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusiness } from './app';


const initialState = {
  currentProduct: {
    id: '',
    cartId: '',
    isFetching: false,
  },
  shoppingCart: {
    isFetching: false,
    itemIds: [],
    unavailableItemIds: [],
  },
  onlineCategory: {
    isFetching: false,
    categoryIds: [],
  },
};

export const types = {
  // fetch shoppingCart
  FETCH_SHOPPINGCART_REQUEST: 'ORDERING/HOME/FETCH_SHOPPINGCART_REQUEST',
  FETCH_SHOPPINGCART_SUCCESS: 'ORDERING/HOME/FETCH_SHOPPINGCART_SUCCESS',
  FETCH_SHOPPINGCART_FAILURE: 'ORDERING/HOME/FETCH_SHOPPINGCART_FAILURE',

  // fetch onlineCategory
  FETCH_ONLINECATEGORY_REQUEST: 'ORDERING/HOME/FETCH_ONLINECATEGORY_REQUEST',
  FETCH_ONLINECATEGORY_SUCCESS: 'ORDERING/HOME/FETCH_ONLINECATEGORY_SUCCESS',
  FETCH_ONLINECATEGORY_FAILURE: 'ORDERING/HOME/FETCH_ONLINECATEGORY_FAILURE',

  // mutable removeShoppingCartItem
  REMOVE_SHOPPINGCARTITEM_REQUEST: 'ORDERING/HOME/REMOVE_SHOPPINGCARTITEM_REQUEST',
  REMOVE_SHOPPINGCARTITEM_SUCCESS: 'ORDERING/HOME/REMOVE_SHOPPINGCARTITEM_SUCCESS',
  REMOVE_SHOPPINGCARTITEM_FAILURE: 'ORDERING/HOME/REMOVE_SHOPPINGCARTITEM_FAILURE',

  // fetch productDetail
  FETCH_PRODUCTDETAIL_REQUEST: 'ORDERING/HOME/FETCH_PRODUCTDETAIL__REQUEST',
  FETCH_PRODUCTDETAIL_SUCCESS: 'ORDERING/HOME/FETCH_PRODUCTDETAIL__SUCCESS',
  FETCH_PRODUCTDETAIL_FAILURE: 'ORDERING/HOME/FETCH_PRODUCTDETAIL__FAILURE',

  // mutable addOrUpdateShoppingCartItem
  ADDORUPDATE_SHOPPINGCARTITEM_REQUEST: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_REQUEST',
  ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS',
  ADDORUPDATE_SHOPPINGCARTITEM_FAILURE: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_FAILURE',

  // - or + on home page product item
  DECREASE_PRODUCT_IN_CART: 'ORDERING/HOME/DECREASE_PRODUCT_IN_CART',
  INCREASE_PRODUCT_IN_CART: 'ORDERING/HOME/INCREASE_PRODUCT_IN_CART',
};

// actions
export const actions = {

  // load product list group by category, and shopping cart
  loadProductList: () => (dispatch, getState) => {
    if (getState().home.onlineCategory.categoryIds.length) {
      return;
    }

    dispatch(fetchOnlineCategory());
    dispatch(fetchShoppingCart());
  },

  // load shopping cart
  loadShoppingCart: () => (dispatch) => {
    dispatch(fetchShoppingCart());
  },

  removeShoppingCartItem: (variables) => (dispatch) => {
    return dispatch(removeShoppingCartItem(variables));
  },

  addOrUpdateShoppingCartItem: (variables) => (dispatch) => {
    return dispatch(addOrUpdateShoppingCartItem(variables));
  },

  // decrease clicked on product item
  decreaseProductInCart: (shoppingCart, prod) => (dispatch, getState) => {
    const cartItem = (shoppingCart.items || []).find(item => item.productId === prod.id || item.parentProductId === prod.id);

    if (prod.cartQuantity === 1) {
      return dispatch(removeShoppingCartItem({
        productId: cartItem.productId,
        variations: cartItem.variations,
      }));
    }

    return dispatch(addOrUpdateShoppingCartItem({
      action: 'edit',
      business: getBusiness(getState()),
      productId: cartItem.productId,
      quantity: prod.cartQuantity - 1,
      variations: cartItem.variations || [],
    }));
  },

  // increase clicked on product item
  increaseProductInCart: (prod) => (dispatch, getState) => {
    const cartItem = (prod.cartItems || []).find(item => item.productId === prod.id || item.parentProductId === prod.id);

    if (prod.variations && prod.variations.length) {
      if (prod._needMore) {
        return dispatch(fetchProductDetail({ productId: prod.id }));
      }

      return;
    }

    return dispatch(addOrUpdateShoppingCartItem({
      action: 'edit',
      business: getBusiness(getState()),
      productId: prod.id,
      quantity: prod.cartQuantity + 1,
      variations: (prod.hasSingleChoice && prod.cartItems.length === 1) ? cartItem.variations : [],
    }));
  },
};

const fetchShoppingCart = () => {
  const endpoint = Url.apiGql('ShoppingCart');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_SHOPPINGCART_REQUEST,
        types.FETCH_SHOPPINGCART_SUCCESS,
        types.FETCH_SHOPPINGCART_FAILURE,
      ],
      endpoint,
    },
  };
}

const fetchOnlineCategory = () => {
  const endpoint = Url.apiGql('OnlineCategory');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINECATEGORY_REQUEST,
        types.FETCH_ONLINECATEGORY_SUCCESS,
        types.FETCH_ONLINECATEGORY_FAILURE,
      ],
      endpoint,
    },
  };
}
// variables := { productId, variations }
const removeShoppingCartItem = (variables) => {
  const endpoint = Url.apiGql('RemoveShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.REMOVE_SHOPPINGCARTITEM_REQUEST,
        types.REMOVE_SHOPPINGCARTITEM_SUCCESS,
        types.REMOVE_SHOPPINGCARTITEM_FAILURE
      ],
      endpoint,
      variables,
    }
  };
};

const addOrUpdateShoppingCartItem = (variables) => {
  const endpoint = Url.apiGql('AddOrUpdateShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST,
        types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS,
        types.ADDORUPDATE_SHOPPINGCARTITEM_FAILURE
      ],
      endpoint,
      variables,
    }
  };
};

const fetchProductDetail = (variables) => {
  const endpoint = Url.apiGql('ProductDetail');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_PRODUCTDETAIL_REQUEST,
        types.FETCH_PRODUCTDETAIL_SUCCESS,
        types.FETCH_PRODUCTDETAIL_FAILURE
      ],
      endpoint,
      variables,
    }
  };
}

// reducers
const currentProduct = (state = initialState.currentProduct, action) => {
  if (action.type === types.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      id: product.id,
    };
  }
  else if (action.type === types.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false };
  }
  return state;
}

const shoppingCart = (state = initialState.shoppingCart, action) => {
  if (action.responseGql) {
    const { emptyShoppingCart } = action.responseGql.data || {};
    if (emptyShoppingCart && emptyShoppingCart.success) {
      return { ...state, isFetching: false, itemIds: [], unavailableItemIds: [] };
    }
  }

  switch (action.type) {
    case types.FETCH_SHOPPINGCART_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_SHOPPINGCART_SUCCESS: {
      const { shoppingCart } = action.responseGql.data;

      return {
        ...state,
        isFetching: false,
        itemIds: shoppingCart.items.map(item => item.id),
        unavailableItemIds: shoppingCart.unavailableItems.map(item => item.id),
      }
    }
    case types.FETCH_SHOPPINGCART_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
}

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
}

export default combineReducers({
  currentProduct,
  shoppingCart,
  onlineCategory,
});

// selectors
export const isFetched = (state) => state.home.shoppingCart.isFetched

export const getCartItemIds = (state) => state.home.shoppingCart.itemIds

export const getCartUnavailableItemIds = (state) => state.home.shoppingCart.unavailableItemIds

export const getShoppingCart = createSelector(
  [getCartSummary, getCartItemIds, getCartUnavailableItemIds, getAllCartItems],
  (summary, itemIds, unavailableItemIds, carts) => {
    return {
      summary,
      items: itemIds.map(id => carts[id]),
      unavailableItems: unavailableItemIds.map(id => carts[id]),
    }
  }
);

export const getCartItemList = (state) => {
  return state.home.shoppingCart.itemIds.map(id => getCartItemById(state, id));
}

export const getCategoryIds = (state) => state.home.onlineCategory.categoryIds;

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

  return onlineCategory.map((category) => {
    const { products } = category;

    category.cartQuantity = 0;

    products.forEach(function (product) {
      product.variations = product.variations || [];
      product.soldOut = Utils.isProductSoldOut(product);
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
}

export const getCategoryProductList = createSelector(
  [getAllProducts, getAllCategories, getCartItemList],
  (products, categories, carts) => {
    if (!products || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories).map(category => {
      return {
        ...category,
        products: category.products.map(id => {
          const product = JSON.parse(JSON.stringify(products[id]));
          return {
            ...product,
          };
        }),
      };
    }).filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);

export const getCurrentProduct = (state) => state.home.currentProduct;
