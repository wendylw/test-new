import cartReducers, { initialState, getBusinessInfo, getPendingTransactionIds } from './cart';
import rootReducer from './index';
import { CART_TYPES as types } from '../types';

describe('src/ordering/redux/modules/cart.js: reducers', () => {
  const cartStoreInfoActionInfo = {
    response: {
      transactions: [{ orderId: '123' }, { orderId: '456' }],
    },
  };
  it('FETCH_PENDING_TRANSACTIONS_SUCCESS', () => {
    const action = {
      type: types.FETCH_PENDING_TRANSACTIONS_SUCCESS,
      ...cartStoreInfoActionInfo,
    };
    const expectedState = {
      pendingTransactionsIds: ['123', '456'],
    };
    expect(cartReducers(undefined, action)).toEqual(expectedState);
  });
  it('UPDATE_TRANSACTIONS_STATUS_SUCCESS', () => {
    const action = {
      type: types.UPDATE_TRANSACTIONS_STATUS_SUCCESS,
      ...cartStoreInfoActionInfo,
    };
    const expectedState = {
      pendingTransactionsIds: [],
    };
    expect(cartReducers(undefined, action)).toEqual(expectedState);
  });
  it('default', () => {
    expect(cartReducers(undefined, { type: 'default' })).toEqual({ pendingTransactionsIds: [] });
  });
});
describe('src/ordering/redux/modules/cart.js:selectors', () => {
  const state = rootReducer(undefined, { type: null });
  it('getBusinessInfo', () => {
    expect(getBusinessInfo(state)).toEqual({});
  });
  it('getPendingTransactionIds', () => {
    expect(getPendingTransactionIds(state)).toEqual([]);
  });
});
