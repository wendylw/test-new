import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import url from '../../../utils/url';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness, getRequestInfo } from './app';

const initialState = {
  orderId: null,
};

export const types = {
  // fetch order
  FETCH_ORDER_REQUEST: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_FAILURE',

  // fetch coreBusiness
  FETCH_COREBUSINESS_REQUEST: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_REQUEST',
  FETCH_COREBUSINESS_SUCCESS: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_SUCCESS',
  FETCH_COREBUSINESS_FAILURE: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_FAILURE',
}

export const actions = {
  loadOrder: (orderId) => (dispatch, getState) => {
    return dispatch(fetchOrder({ orderId }));
  },
  loadCoreBusiness: () => (dispatch, getState) => {
    const { storeId } = getRequestInfo(getState());
    const business = getBusiness(getState());
    return dispatch(fetchCoreBusiness({ business, storeId }));
  },
};

const fetchOrder = variables => ({
  [FETCH_GRAPHQL]: {
    types: [
      types.FETCH_ORDER_REQUEST,
      types.FETCH_ORDER_SUCCESS,
      types.FETCH_ORDER_FAILURE,
    ],
    endpoint: url.apiGql('Order'),
    variables,
  }
})

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [
      types.FETCH_COREBUSINESS_REQUEST,
      types.FETCH_COREBUSINESS_SUCCESS,
      types.FETCH_COREBUSINESS_FAILURE,
    ],
    endpoint: url.apiGql('CoreBusiness'),
    variables,
  }
})

// reducer
const reducer = (state = initialState, action) => {
  if (action.type === types.FETCH_ORDER_SUCCESS) {
    const { data } = action.responseGql;
    return { ...state, orderId: data.order.orderId };
  }
  return state;
}

export default reducer;

// selectors
export const getOrder = state => {
  return getOrderByOrderId(state, state.thankYou.orderId)
};

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
}