import claimReducers, {
  initialState,
  getBusinessInfo,
  isFetchingCashbackInfo,
  getCashbackInfo,
  getReceiptNumber,
} from './claim';
import rootReducer from '../../redux/modules';
import { CLAIM_TYPES as types } from '../types';

describe('src/cashback/redux/modules/claim.js:reducers', () => {
  const claimActionInfo = {
    response: {
      customerId: '123456',
      consumerId: '111111',
      status: 'mockedStatus',
      receiptNumber: '12345678',
    },
  };

  it('fetch and create cashback request', () => {
    const expectedState = {
      ...initialState,
      cashbackInfo: {
        isFetching: true,
      },
    };
    expect(claimReducers(undefined, { type: types.FETCH_CASHBACKINFO_REQUEST })).toEqual(expectedState);
    expect(claimReducers(undefined, { type: types.CREATE_CASHBACKINFO_REQUEST })).toEqual(expectedState);
  });

  it('fetch and create cashback failure', () => {
    const expectedState = {
      ...initialState,
      cashbackInfo: {
        isFetching: false,
      },
    };
    expect(claimReducers(undefined, { type: types.FETCH_CASHBACKINFO_FAILURE })).toEqual(expectedState);
    expect(claimReducers(undefined, { type: types.CREATE_CASHBACKINFO_FAILURE })).toEqual(expectedState);
  });

  it('FETCH_RECEIPTNUMBER_REQUEST', () => {
    const expectedState = { ...initialState, isFetching: true };
    expect(claimReducers(undefined, { type: types.FETCH_RECEIPTNUMBER_REQUEST })).toEqual(expectedState);
  });

  it('FETCH_RECEIPTNUMBER_FAILURE', () => {
    const expectedState = { ...initialState, isFetching: false };
    expect(claimReducers(undefined, { type: types.FETCH_RECEIPTNUMBER_FAILURE })).toEqual(expectedState);
  });

  it('FETCH_CASHBACKINFO_SUCCESS', () => {
    const expectedState = {
      ...initialState,
      cashbackInfo: {
        customerId: '123456',
        consumerId: '111111',
        status: 'mockedStatus',
        isFetching: false,
        loadedCashbackInfo: true,
        createdCashbackInfo: false,
        receiptNumber: '12345678',
      },
    };
    const action = {
      type: types.FETCH_CASHBACKINFO_SUCCESS,
      ...claimActionInfo,
    };
    expect(claimReducers(undefined, action)).toEqual(expectedState);
  });

  it('CREATE_CASHBACKINFO_SUCCESS', () => {
    const expectedState = {
      ...initialState,
      cashbackInfo: {
        ...initialState.cashbackInfo,
        ...claimActionInfo.response,
        isFetching: false,
        loadedCashbackInfo: false,
        createdCashbackInfo: true,
      },
    };
    const action = {
      type: types.CREATE_CASHBACKINFO_SUCCESS,
      ...claimActionInfo,
    };
    expect(claimReducers(undefined, action)).toEqual(expectedState);
  });

  it('FETCH_RECEIPTNUMBER_SUCCESS', () => {
    const expectedState = {
      ...initialState,
      isFetching: false,
      receiptNumber: '12345678',
    };
    const action = {
      type: types.FETCH_RECEIPTNUMBER_SUCCESS,
      ...claimActionInfo,
    };
    expect(claimReducers(undefined, action)).toEqual(expectedState);
  });

  it('default', () => {
    expect(claimReducers(undefined, { type: 'default' })).toEqual({ ...initialState });
  });
});

describe('src/cashback/redux/modules/claim.js:selectors', () => {
  const state = rootReducer(undefined, { type: null });
  it('getBusinessInfo', () => {
    expect(getBusinessInfo(state)).toEqual(undefined);
  });
  it('isFetchingCashbackInfo', () => {
    const expectedState = initialState.isFetching;
    expect(isFetchingCashbackInfo(state)).toEqual(expectedState);
  });
  it('getCashbackInfo', () => {
    const expectedState = initialState.cashbackInfo;
    expect(getCashbackInfo(state)).toEqual(expectedState);
  });
  it('getReceiptNumber', () => {
    const expectedState = initialState.receiptNumber;
    expect(getReceiptNumber(state)).toEqual(expectedState);
  });
});
