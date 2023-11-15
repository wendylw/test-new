import { actions } from './home';
import { HOME_TYPES as types } from '../types';
import {
  store,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';

describe('src/cashback/redux/modules/home.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
    describe('getReceiptList', () => {
      const reqParams = { business: 'beep', page: 0, pageSize: 10 };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_RECEIPT_LIST_REQUEST },
          { type: types.FETCH_RECEIPT_LIST_SUCCESS, response: commonSuccessData, params: reqParams },
        ];
        return expectedActionsCheck(
          actions.getReceiptList(reqParams.business, reqParams.page, reqParams.pageSize),
          expectedActions
        );
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_RECEIPT_LIST_REQUEST },
          { type: types.FETCH_RECEIPT_LIST_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(
          actions.getReceiptList(reqParams.business, reqParams.page, reqParams.pageSize),
          expectedActions
        );
      });
    });

    describe('getCashbackHistory', () => {
      const reqParams = { customerId: '111111' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.GET_CASHBACK_HISTORIES_REQUEST },
          { type: types.GET_CASHBACK_HISTORIES_SUCCESS, response: commonSuccessData, params: reqParams },
        ];
        return expectedActionsCheck(actions.getCashbackHistory(reqParams.customerId), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.GET_CASHBACK_HISTORIES_REQUEST },
          { type: types.GET_CASHBACK_HISTORIES_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.getCashbackHistory(reqParams.customerId), expectedActions);
      });
    });
  });
});
