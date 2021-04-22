import { actions } from './thankYou';
import { THANK_YOU_TYPES as types } from '../types';
import {
  store,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';

describe('src/ordering/redux/modules/thankyou.js: actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('Async Action Creators', () => {
    describe('loadOrder', () => {
      it('Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ORDER_REQUEST },
          { type: types.FETCH_ORDER_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.loadOrder('123456'), expectedActions);
      });
      it('Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_ORDER_REQUEST },
          { type: types.FETCH_ORDER_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.loadOrder('123456'), expectedActions);
      });
    });
    describe('getCashbackInfo', () => {
      it('Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACKINFO_REQUEST },
          {
            type: types.FETCH_CASHBACKINFO_SUCCESS,
            response: commonSuccessData,
            params: { receiptNumber: '123456', source: 'QR_ORDERING' },
          },
        ];
        return expectedActionsCheck(actions.getCashbackInfo('123456'), expectedActions);
      });
      it('Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACKINFO_REQUEST },
          { type: types.FETCH_CASHBACKINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.getCashbackInfo('123456'), expectedActions);
      });
      describe('createCashbackInfo', () => {
        const reqParams = {
          receiptNumber: '123456',
          phone: '18711112222',
          source: 'QR_ORDERING',
        };
        it('Success', () => {
          successMockFetch();
          const expectedActions = [
            { type: types.CREATE_CASHBACKINFO_REQUEST },
            { type: types.CREATE_CASHBACKINFO_SUCCESS, response: commonSuccessData, params: reqParams },
          ];
          return expectedActionsCheck(actions.createCashbackInfo(reqParams), expectedActions);
        });
        it('Fail', () => {
          failMockFetch();
          const expectedActions = [
            { type: types.CREATE_CASHBACKINFO_REQUEST },
            { type: types.CREATE_CASHBACKINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
          ];
          return expectedActionsCheck(actions.createCashbackInfo(reqParams), expectedActions);
        });
      });
    });
  });
});
