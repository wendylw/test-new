import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { getBusiness, getRequestInfo } from './app';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { API_REQUEST } from '../../../redux/middlewares/api';

const initialState = {
  paidTotal: 0,
};

export const types = CART_TYPES;

// actions
export const actions = {
  clearAll: () => (dispatch) => {
    return dispatch(emptyShoppingCart());
  },

  loadCoreBusiness: () => (dispatch, getState) => {
    const { storeId } = getRequestInfo(getState());
    const business = getBusiness(getState());

    return dispatch(fetchCoreBusiness({ business, storeId }));
  },

  loadTotalCalculateResult: ({ initial, subtraction }) => ({
    [API_REQUEST]: {
      types: [
        types.TOTAL_CALCULATOR_REQUEST,
        types.TOTAL_CALCULATOR_SUCCESS,
        types.TOTAL_CALCULATOR_FAILURE,
      ],
      ...Url.API_URLS.CALCULATE_RESULT,
      payload: {
        initial,
        subtraction,
      },
    }
  })
};

const emptyShoppingCart = () => {
  const endpoint = Url.apiGql('EmptyShoppingCart');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.CLEARALL_REQUEST,
        types.CLEARALL_SUCCESS,
        types.CLEARALL_FAILURE,
      ],
      endpoint,
    },
  };
};

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [
      types.FETCH_COREBUSINESS_REQUEST,
      types.FETCH_COREBUSINESS_SUCCESS,
      types.FETCH_COREBUSINESS_FAILURE,
    ],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  }
});

// reducers
const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.TOTAL_CALCULATOR_SUCCESS: {
      const { result } = response || {};

      return { ...state, paidTotal: result };
    }
    default:
      return state;
  }
}

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business);
};

export const getPaidTotal = state => state.cart.paidTotal;

// selectors
