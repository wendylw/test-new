import Url from '../../../utils/url';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const initialState = {
};

export const types = {
  // clear all
  CLEARALL_REQUEST: 'REDUX_DEMO/CART/CLEARALL_REQUEST',
  CLEARALL_SUCCESS: 'REDUX_DEMO/CART/CLEARALL_SUCCESS',
  CLEARALL_FAILURE: 'REDUX_DEMO/CART/CLEARALL_FAILURE',
};

// actions
export const actions = {
  clearAll: () => (dispatch, getState) => {
    return dispatch(emptyShoppingCart());
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

// reducers
const reducer = (state = initialState, action) => {
  return state;
}

export default reducer;

// selectors
