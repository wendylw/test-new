import thankyouReducers, { initialState } from './thankYou';
import { THANK_YOU_TYPES as types } from '../types';

describe('src/ordering/redux/modules/payment.js: reducers', () => {
  const thankyouActionInfo = {
    response: {
      info: 'ok',
    },
    responseGql: {
      data: {
        order: {
          orderId: '123456',
        },
      },
    },
  };
  it('FETCH_ORDER_SUCCESS', () => {
    const action = {
      type: types.FETCH_ORDER_SUCCESS,
      ...thankyouActionInfo,
    };
    const expectedState = {
      ...initialState,
      orderId: '123456',
    };
    expect(thankyouReducers(undefined, action)).toEqual(expectedState);
  });
  it('isFetching is cashbackInfo should be true', () => {
    const action = {
      type: types.FETCH_CASHBACKINFO_REQUEST,
      ...thankyouActionInfo,
    };
    const action1 = {
      type: types.CREATE_CASHBACKINFO_REQUEST,
      ...thankyouActionInfo,
    };
    const expectedState = {
      ...initialState,
      cashbackInfo: {
        cashbackInfo: null,
        isFetching: true,
      },
    };
    expect(thankyouReducers(undefined, action)).toEqual(expectedState);
    expect(thankyouReducers(undefined, action1)).toEqual(expectedState);
  });

  // it('default', () => {
  //     expect(thankyouReducers(undefined, { type: 'default' })).toEqual(initialState);
  // });
});
