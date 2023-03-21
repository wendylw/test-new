import homeReducers, {
  initialState,
  getReceiptList,
  getFetchState,
  getCashbackHistorySummary,
  getBusinessInfo,
  getCashbackHistory,
} from './home';
import rootReducer from './index';
import { HOME_TYPES as types } from '../types';

describe('src/cashback/redux/modules/home.js:reducers', () => {
  const homeActionInfo = {
    response: {
      list: [
        {
          id: '',
          receiptNumber: '12345678',
          business: 'beep',
          createdTime: '',
          storeId: '',
          total: 40,
          transactionType: 'Sale',
        },
      ],
      totalCredits: 20,
    },
    customerId: '111111',
  };

  it('SET_CUSTOMER_ID_SUCCESS', () => {
    const action = {
      type: types.SET_CUSTOMER_ID_SUCCESS,
      ...homeActionInfo,
    };
    const expectedState = {
      ...initialState,
    };
    expect(homeReducers(undefined, action)).toEqual(expectedState);
  });

  it('GET_CASHBACK_HISTORIES_SUCCESS with no response', () => {
    const action = {
      type: types.GET_CASHBACK_HISTORIES_SUCCESS,
    };
    expect(homeReducers(undefined, action)).toEqual({
      ...initialState,
      cashbackHistorySummary: {
        ...initialState.cashbackHistorySummary,
      },
    });
  });

  it('GET_CASHBACK_HISTORIES_SUCCESS', () => {
    const action = {
      type: types.GET_CASHBACK_HISTORIES_SUCCESS,
      ...homeActionInfo,
    };
    expect(homeReducers(undefined, action)).toEqual({
      ...initialState,
      cashbackHistorySummary: {
        ...initialState.cashbackHistorySummary,
        totalCredits: 20,
      },
    });
  });

  it('FETCH_RECEIPT_LIST_SUCCESS with no response', () => {
    const action = {
      type: types.FETCH_RECEIPT_LIST_SUCCESS,
    };
    expect(homeReducers(undefined, action)).toEqual({
      ...initialState,
      receiptList: [],
      fetchState: false,
    });
  });

  it('FETCH_RECEIPT_LIST_SUCCESS', () => {
    const action = {
      type: types.FETCH_RECEIPT_LIST_SUCCESS,
      ...homeActionInfo,
    };
    expect(homeReducers(undefined, action)).toEqual({
      ...initialState,
      receiptList: [
        {
          id: '',
          receiptNumber: '12345678',
          business: 'beep',
          createdTime: '',
          storeId: '',
          total: 40,
          transactionType: 'Sale',
        },
      ],
      fetchState: true,
    });
  });
});

describe('src/cashback/redux/modules/home.js:selectors', () => {
  const state = rootReducer(undefined, { type: null });
  it('getBusinessInfo', () => {
    expect(getBusinessInfo(state)).toEqual(undefined);
  });
  it('getReceiptList', () => {
    const expectedState = initialState.receiptList;
    expect(getReceiptList(state)).toEqual(expectedState);
  });
  it('getFetchState', () => {
    const expectedState = initialState.fetchState;
    expect(getFetchState(state)).toEqual(expectedState);
  });
  it('getCashbackHistorySummary', () => {
    const expectedState = initialState.cashbackHistorySummary;
    expect(getCashbackHistorySummary(state)).toEqual(expectedState);
  });
  it('getCashbackHistory', () => {
    expect(getCashbackHistory(state)).toEqual(undefined);
  });
});
