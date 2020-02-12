import paymentReducers, {
  initialState,
  types,
  getCurrentPayment,
  getCurrentOrderId,
  getThankYouPageUrl,
  getBraintreeToken,
  getBankList,
} from './payment';
import rootReducer from './index';

describe('src/ordering/redux/modules/payment.js: reducers', () => {
  const paymentActionInfo = {
    paymentName: 'mockPaymentName',
    response: {
      token: 'mockToken',
      bankingList: [],
    },
    responseGql: {
      data: {
        order: {
          orderId: '123456',
        },
        orders: [
          {
            orderId: '123456',
          },
        ],
        redirectUrl: 'mock redirectUrl',
      },
    },
  };
  it('SET_CURRENT_PAYMENT', () => {
    const action = {
      type: types.SET_CURRENT_PAYMENT,
      ...paymentActionInfo,
    };
    const expectedState = {
      ...initialState,
      currentPayment: 'mockPaymentName',
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('CREATEORDER_SUCCESS', () => {
    const action = {
      type: types.CREATEORDER_SUCCESS,
      ...paymentActionInfo,
    };
    const expectedState = {
      ...initialState,
      orderId: '123456',
      thankYouPageUrl: 'mock redirectUrl',
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('FETCH_ORDER_SUCCESS', () => {
    const action = {
      type: types.FETCH_ORDER_SUCCESS,
      ...paymentActionInfo,
    };
    const expectedState = {
      ...initialState,
      orderId: '123456',
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('FETCH_BRAINTREE_TOKEN_SUCCESS', () => {
    const action = {
      type: types.FETCH_BRAINTREE_TOKEN_SUCCESS,
      ...paymentActionInfo,
    };
    const expectedState = {
      ...initialState,
      braintreeToken: 'mockToken',
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('CLEAR_BRAINTREE_TOKEN', () => {
    const action = {
      type: types.CLEAR_BRAINTREE_TOKEN,
    };
    const expectedState = {
      ...initialState,
      braintreeToken: '',
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('FETCH_BANKLIST_SUCCESS', () => {
    const action = {
      type: types.FETCH_BANKLIST_SUCCESS,
      ...paymentActionInfo,
    };
    const expectedState = {
      ...initialState,
      bankingList: [],
    };
    expect(paymentReducers(undefined, action)).toEqual(expectedState);
  });
  it('default', () => {
    expect(paymentReducers(undefined, { type: 'default' })).toEqual(initialState);
  });
});
describe('src/ordering/redux/modules/payment.js: reducers', () => {
  const state = rootReducer(undefined, { type: null });
  it('getCurrentPayment', () => {
    expect(getCurrentPayment(state)).toEqual(initialState.currentPayment);
  });
  it('getCurrentOrderId', () => {
    expect(getCurrentOrderId(state)).toEqual(initialState.orderId);
  });
  it('getThankYouPageUrl', () => {
    expect(getThankYouPageUrl(state)).toEqual(initialState.thankYouPageUrl);
  });
  it('getBraintreeToken', () => {
    expect(getBraintreeToken(state)).toEqual(initialState.braintreeToken);
  });
  it('getBankList', () => {
    expect(getBankList(state)).toEqual(initialState.bankingList);
  });
});
