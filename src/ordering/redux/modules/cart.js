import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { getBusiness, getUser, getRequestInfo } from './app';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

const initialState = {
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

  loadAvailableCashback: () => (dispatch, getState) => {
    const business = getBusiness(getState());
    const user = getUser(getState());
    const { consumerId } = user || {};

    dispatch(fetchAvailableCashback({
      consumerId,
      business,
    }));
  },
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

const fetchAvailableCashback = ({ consumerId, business }) => ({
  [API_REQUEST]: {
    types: [
      types.FETCH_AVAILABLE_CASHBACK_REQUEST,
      types.FETCH_AVAILABLE_CASHBACK_SUCCESS,
      types.FETCH_AVAILABLE_CASHBACK_FAILURE,
    ],
    ...Url.API_URLS.GET_AVAILABLE_CASHBACK(consumerId, business),
  }
});

// reducers
const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.FETCH_AVAILABLE_CASHBACK_SUCCESS:
      return { ...state, currentPayment: action.paymentName };
    default:
      return state;
  }
}

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business);
}

// selectors
