import url from '../../../utils/url';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import Constants from '../../../Constants';
import { getBusiness, getRequestInfo } from './app';
import { getCartItemIds } from './home';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';

const initialState = {
  currentPayment: Constants.PAYMENT_METHODS.ONLINE_BANKING_PAY,
  orderId: '',
};

export const types = {
  // createOrder
  CREATEORDER_REQUEST: 'REDUX_DEMO/PAYMENT/CREATEORDER_REQUEST',
  CREATEORDER_SUCCESS: 'REDUX_DEMO/PAYMENT/CREATEORDER_SUCCESS',
  CREATEORDER_FAILURE: 'REDUX_DEMO/PAYMENT/CREATEORDER_FAILURE',

  // setCurrentPayment
  SET_CURRENT_PAYMENT: 'REDUX_DEMOPAYMENTT/SET_CURRENT_PAYMENT'
};

// action creators
export const actions = {
  createOrder: () => (dispatch, getState) => {
    const business = getBusiness(getState());
    const shoppingCartIds = getCartItemIds(getState());
    const { storeId, tableId } = getRequestInfo(getState());
    const variables = {
      business,
      storeId,
      tableId,
      shoppingCartIds
    };

    return dispatch(createOrder(variables));
  },

  setCurrentPayment: paymentName => ({
    type: types.SET_CURRENT_PAYMENT,
    paymentName
  })
};

const createOrder = variables => {
  const endpoint = url.apiGql('CreateOrder');

  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.CREATEORDER_REQUEST,
        types.CREATEORDER_SUCCESS,
        types.CREATEORDER_FAILURE
      ],
      endpoint,
      variables
    }
  };
};

// reducers
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_CURRENT_PAYMENT:
      return { ...state, currentPayment: action.paymentName };
    case types.CREATEORDER_SUCCESS: {
      const { createOrder } = action.responseGql.data || {};
      const [order] = createOrder.orders;
      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getCurrentPayment = state => state.payment.currentPayment;

export const getCurrentOrder = (state) => {
  return getOrderByOrderId(state, state.payment.orderId);
}
