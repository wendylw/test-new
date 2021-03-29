import paymentReducers, { initialState, types, getCurrentOrderId, getThankYouPageUrl } from './payment';
import rootReducer from './index';

describe('src/ordering/redux/modules/payment.js: reducers', () => {
  const paymentActionInfo = {
    paymentLabel: 'mockPaymentName',
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
  it('default', () => {
    expect(paymentReducers(undefined, { type: 'default' })).toEqual(initialState);
  });
});
describe('src/ordering/redux/modules/payment.js: reducers', () => {
  const state = rootReducer(undefined, { type: null });
  it('getCurrentOrderId', () => {
    expect(getCurrentOrderId(state)).toEqual(initialState.orderId);
  });
  it('getThankYouPageUrl', () => {
    expect(getThankYouPageUrl(state)).toEqual(initialState.thankYouPageUrl);
  });
});
