import { APP_TYPES } from '../../../ordering/redux/types';

const initialState = {
  summary: {
    count: 0,
    discount: 0,
    subtotal: 0,
    total: 0,
    tax: 0,
    storeCreditsBalance: 0,
  },
  data: {},
};

const commonReducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { shoppingCart } = action.responseGql.data || {};

    if (!shoppingCart) {
      return state;
    }

    const { items, unavailableItems, ...summary } = shoppingCart;

    // Only deal with response.data.shoppingCart
    const kvData = {};
    items.forEach(item => {
      kvData[item.id] = {
        ...item,
        _available: true, // attached field
      };
    });
    unavailableItems.forEach(item => {
      kvData[item.id] = {
        ...item,
        _available: false, // attached field
      };
    });

    return {
      ...state,
      summary: Object.assign(state.summary, summary),
      data: kvData
    };
  }

  return state;
}

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { emptyShoppingCart } = action.responseGql.data || {};

    if (emptyShoppingCart && emptyShoppingCart.success) {
      return { ...state, summary: initialState.summary, data: {} };
    }
  } else if (action.type === APP_TYPES.FETCH_AVAILABLE_CASHBACK_SUCCESS) {
    //TODO: let's use schema name in the response from Api middleware, so that each entities can get response data from its name named data.

    const { storeCreditsBalance } = action.response || {};

    return {
      ...state,
      summary: {
        ...state.summary,
        storeCreditsBalance,
      },
    };
  }

  return commonReducer(state, action);
}

export default reducer;

// selectors

export const getAllCartItems = (state) => {
  return state.entities.carts.data;
}

export const getCartItemById = (state, id) => {
  return state.entities.carts.data[id];
}

export const getCartSummary = (state) => {
  return state.entities.carts.summary;
}
