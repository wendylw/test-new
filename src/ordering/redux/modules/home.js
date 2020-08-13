import { createSelector } from 'reselect';
import Url from '../../../utils/url';
import { HOME_TYPES } from '../types';
import Utils from '../../../utils/utils';
import * as VoucherUtils from '../../../voucher/utils';

import { combineReducers } from 'redux';
// import { computeDeliveryDistance } from '../../containers/Location/utils';
import { getCartSummary, getAllCartItems, getCartItemById } from '../../../redux/modules/entities/carts';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { API_REQUEST } from '../../../redux/middlewares/api';
import config from '../../../config';
import { getBusiness } from './app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
// import { getBusinessInfo } from './cart';

export const initialState = {
  domProperties: {
    verticalMenuBusinesses: config.verticalMenuBusinesses,
    // 33.8% equal (item padding + item image + item cart controller button height) / window width
    productItemMinHeight:
      ((document.body.clientWidth || window.innerWidth) && (document.body.clientWidth || window.innerWidth) < 170
        ? document.body.clientWidth || window.innerWidth
        : 414) * 0.26,
  },
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
  popUpModal: {
    userConfirmed: false,
  },
  timeSlot: {
    timeSlotList: [],
  },
  coreStore: {
    isFetching: false,
    storeList: [],
    storeHashCode: '',
  },
};

export const types = HOME_TYPES;

types.FETCH_TIMESLOT_REQUEST = 'ORDERING/HOME/FETCH_TIMESLOT_REQUEST';
types.FETCH_TIMESLOT_SUCCESS = 'ORDERING/HOME/FETCH_TIMESLOT_SUCCESS';
types.FETCH_TIMESLOT_FAILURE = 'ORDERING/HOME/FETCH_TIMESLOT_FAILURE';
types.FETCH_CORESTORES_REQUEST = 'STORES/HOME/FETCH_CORESTORES_REQUEST';
types.FETCH_CORESTORES_SUCCESS = 'STORES/HOME/FETCH_CORESTORES_SUCCESS';
types.FETCH_CORESTORES_FAILURE = 'STORES/HOME/FETCH_CORESTORES_FAILURE';
types.FETCH_STORE_HASHCODE_REQUEST = 'STORES/HOME/FETCH_STORE_HASHCODE_REQUEST';
types.FETCH_STORE_HASHCODE_SUCCESS = 'STORES/HOME/FETCH_STORE_HASHCODE_SUCCESS';
types.FETCH_STORE_HASHCODE_FAILURE = 'STORES/HOME/FETCH_STORE_HASHCODE_FAILURE';
// actions
export const actions = {
  // load product list group by category, and shopping cart
  loadProductList: () => (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    let deliveryCoords;
    if (isDelivery) {
      deliveryCoords = Utils.getDeliveryCoords();
    }
    config.storeId && dispatch(fetchShoppingCart(isDelivery, deliveryCoords));
    // if (!getState().home.onlineCategory.categoryIds.length) {
    dispatch(fetchOnlineCategory({ fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom }));
    // }
  },

  loadCoreStores: address => (dispatch, getState) => {
    const business = getBusiness(getState());
    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [types.FETCH_CORESTORES_REQUEST, types.FETCH_CORESTORES_SUCCESS, types.FETCH_CORESTORES_FAILURE],
        endpoint: Url.apiGql('CoreStores'),
        variables: { business, ...address },
      },
    });
  },

  getStoreHashData: storeId => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_STORE_HASHCODE_REQUEST,
        types.FETCH_STORE_HASHCODE_SUCCESS,
        types.FETCH_STORE_HASHCODE_FAILURE,
      ],
      ...Url.API_URLS.GET_STORE_HASH_DATA(storeId),
    },
  }),

  // load shopping cart
  loadShoppingCart: () => async (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    const isDigital = Utils.isDigitalType();
    if (isDigital) {
      await dispatch(generatorShoppingCartForVoucherOrdering());
      return;
    }

    let deliveryCoords;
    if (isDelivery) {
      deliveryCoords = Utils.getDeliveryCoords();
    }
    await dispatch(fetchShoppingCart(isDelivery, deliveryCoords));
  },

  removeShoppingCartItem: variables => dispatch => {
    return dispatch(removeShoppingCartItem(variables));
  },

  addOrUpdateShoppingCartItem: variables => dispatch => {
    return dispatch(addOrUpdateShoppingCartItem(variables));
  },

  // decrease clicked on product item
  decreaseProductInCart: (shoppingCart, prod) => (dispatch, getState) => {
    const cartItem = (shoppingCart.items || []).find(
      item => item.productId === prod.id || item.parentProductId === prod.id
    );

    if (prod.cartQuantity === 1) {
      return dispatch(
        removeShoppingCartItem({
          productId: cartItem.productId,
          variations: cartItem.variations,
        })
      );
    }
    return dispatch(
      addOrUpdateShoppingCartItem({
        action: 'edit',
        business: getBusiness(getState()),
        productId: cartItem.productId,
        quantity: prod.cartQuantity - 1,
        variations: cartItem.variations || [],
      })
    );
  },

  // increase clicked on product item
  increaseProductInCart: prod => (dispatch, getState) => {
    const cartItem = (prod.cartItems || []).find(
      item => item.productId === prod.id || item.parentProductId === prod.id
    );

    if (prod.variations && prod.variations.length && getState().home.currentProduct.id === prod.id) {
      return;
    }

    if (prod.variations && prod.variations.length) {
      return dispatch(fetchProductDetail({ productId: prod.id }));
    }

    return dispatch(
      addOrUpdateShoppingCartItem({
        action: 'edit',
        business: getBusiness(getState()),
        productId: prod.id,
        quantity: prod.cartQuantity + 1,
        variations: prod.hasSingleChoice && prod.cartItems.length === 1 ? cartItem.variations : [],
      })
    );
  },

  loadProductDetail: prod => dispatch => {
    return dispatch(fetchProductDetail({ productId: prod.id }));
  },

  userConfirmPreOrder: () => ({
    type: types.SET_PRE_ORDER_MODAL_CONFIRM,
  }),

  getTimeSlot: (shippingType, fulfillDate, storeid) => dispatch => {
    return dispatch({
      [API_REQUEST]: {
        types: [types.FETCH_TIMESLOT_REQUEST, types.FETCH_TIMESLOT_SUCCESS, types.FETCH_TIMESLOT_FAILURE],
        ...Url.API_URLS.GET_TIME_SLOT(shippingType, fulfillDate, storeid),
      },
    });
  },
};

export const fetchShoppingCart = (isDeliveryType, deliveryCoords) => {
  return {
    [API_REQUEST]: {
      types: [types.FETCH_SHOPPINGCART_REQUEST, types.FETCH_SHOPPINGCART_SUCCESS, types.FETCH_SHOPPINGCART_FAILURE],
      //...Url.API_URLS.GET_CART,
      ...Url.API_URLS.GET_CART_TYPE(isDeliveryType, deliveryCoords),
    },
  };
};

// generator a virtual shopping cart for Customer place a Voucher Order
export const generatorShoppingCartForVoucherOrdering = () => {
  const orderingInfo = VoucherUtils.getVoucherOrderingInfoFromSessionStorage();
  const shoppingCart = VoucherUtils.generatorVirtualShoppingCart(orderingInfo.selectedVoucher);

  return {
    type: types.FETCH_SHOPPINGCART_SUCCESS,
    response: shoppingCart,
  };
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
// variables := { productId, variations }
export const removeShoppingCartItem = variables => {
  const endpoint = Url.apiGql('RemoveShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.REMOVE_SHOPPINGCARTITEM_REQUEST,
        types.REMOVE_SHOPPINGCARTITEM_SUCCESS,
        types.REMOVE_SHOPPINGCARTITEM_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

export const addOrUpdateShoppingCartItem = variables => {
  const endpoint = Url.apiGql('AddOrUpdateShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST,
        types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS,
        types.ADDORUPDATE_SHOPPINGCARTITEM_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

export const fetchProductDetail = variables => {
  const endpoint = Url.apiGql('ProductDetail');
  return {
    [FETCH_GRAPHQL]: {
      types: [types.FETCH_PRODUCTDETAIL_REQUEST, types.FETCH_PRODUCTDETAIL_SUCCESS, types.FETCH_PRODUCTDETAIL_FAILURE],
      endpoint,
      variables: {
        ...variables,
        fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
      },
    },
  };
};

// reducers
const domProperties = (state = initialState.domProperties, action) => {
  return state;
};

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
  } else if (action.type === types.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false };
  }
  return state;
};

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
      const { items, unavailableItems } = action.response || {};

      return {
        ...state,
        isFetching: false,
        itemIds: items.map(item => item.id),
        unavailableItemIds: unavailableItems.map(item => item.id),
      };
    }
    case types.FETCH_SHOPPINGCART_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
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

const coreStore = (state = initialState.coreStore, action) => {
  switch (action.type) {
    case types.FETCH_CORESTORES_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_CORESTORES_SUCCESS:
      const { stores } = action.responseGql.data.business;
      return {
        ...state,
        isFetching: false,
        storeList: stores,
      };
    case types.FETCH_CORESTORES_FAILURE:
      return { ...state, isFetching: false };
    case types.FETCH_STORE_HASHCODE_SUCCESS: {
      const { response } = action;
      const { redirectTo } = response || {};

      return { ...state, storeHashCode: redirectTo };
    }
    default:
      return state;
  }
};

const popUpModal = (state = initialState.popUpModal, action) => {
  if (action.type === types.SET_PRE_ORDER_MODAL_CONFIRM) {
    return { ...state, userConfirmed: true };
  }
  return state;
};

export default combineReducers({
  domProperties,
  currentProduct,
  shoppingCart,
  onlineCategory,
  popUpModal,
  timeSlot,
  coreStore,
});

// selectors
export const getDeliveryInfo = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);
  // ignore for now since home page needs address from it.
  // if (!allBusinessInfo || Object.keys(allBusinessInfo).length === 0) return null;
  return Utils.getDeliveryInfo({ business, allBusinessInfo });
};

export const isFetched = state => state.home.shoppingCart.isFetched;

export const getStoresList = state => state.home.coreStore.storeList;

export const getStoreHashCode = state => state.home.coreStore.storeHashCode;

export const getCartItemIds = state => state.home.shoppingCart.itemIds;

export const getCartUnavailableItemIds = state => state.home.shoppingCart.unavailableItemIds;

export const getShoppingCart = createSelector(
  [getCartSummary, getCartItemIds, getCartUnavailableItemIds, getAllCartItems],
  (summary, itemIds, unavailableItemIds, carts) => {
    return {
      summary,
      items: itemIds.map(id => carts[id]),
      unavailableItems: unavailableItemIds.map(id => carts[id]),
    };
  }
);
export const getCurrentProduct = state => state.home.currentProduct;

// get cartItems of currentProduct
export const getShoppingCartItemsByProducts = createSelector(
  [getCartItemIds, getAllCartItems, getCurrentProduct],
  (itemIds, carts, product) => {
    const calcItems = itemIds
      .map(id => carts[id])
      .filter(x => x.productId === product.id || x.parentProductId === product.id);
    const items = calcItems.map(x => {
      return {
        productId: x.productId,
        variations: x.variations,
      };
    });
    const count = calcItems.reduce((res, item) => {
      res = res + item.quantity;
      return res;
    }, 0);

    return {
      items,
      count,
    };
  }
);

export const getCartItemList = state => {
  return state.home.shoppingCart.itemIds.map(id => getCartItemById(state, id));
};

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

export const getProductItemMinHeight = state => state.home.domProperties.productItemMinHeight;

export const isVerticalMenuBusiness = state => {
  const { verticalMenuBusinesses } = state.home.domProperties;

  if (!verticalMenuBusinesses || !verticalMenuBusinesses.filter(b => Boolean(b)).length) {
    return true;
  } else {
    return verticalMenuBusinesses.includes(getBusiness(state));
  }
};

export const getPopUpModal = state => state.home.popUpModal;

export const getTimeSlotList = state => state.home.timeSlot.timeSlotList;
