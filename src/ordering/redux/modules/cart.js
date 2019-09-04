import Url from '../../../utils/url';
import { getBusiness, getRequestInfo } from './app';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

const initialState = {
};

export const types = {
  // clear all
  CLEARALL_REQUEST: 'ORDERING/CART/CLEARALL_REQUEST',
  CLEARALL_SUCCESS: 'ORDERING/CART/CLEARALL_SUCCESS',
  CLEARALL_FAILURE: 'ORDERING/CART/CLEARALL_FAILURE',

  // fetch coreBusiness
  FETCH_COREBUSINESS_REQUEST: 'ORDERING/CART/FETCH_COREBUSINESS_REQUEST',
  FETCH_COREBUSINESS_SUCCESS: 'ORDERING/CART/FETCH_COREBUSINESS_SUCCESS',
  FETCH_COREBUSINESS_FAILURE: 'ORDERING/CART/FETCH_COREBUSINESS_FAILURE',
};

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
}

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
})

// reducers
const reducer = (state = initialState, action) => {
  return state;
}

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
}

// selectors
