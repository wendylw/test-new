import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { getBusiness, getRequestInfo } from './app';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

const initialState = {};

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
  return state;
}

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business);
};

// selectors
