import { actions } from './claim';
import { CLAIM_TYPES as types } from '../../../redux/types';
import {
  store,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../../utils/testHelper';

describe('src/cashback/redux/modules/claims.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
    describe('getCashbackInfo', () => {
      const receiptNumber = '123456';
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACKINFO_REQUEST },
          {
            type: types.FETCH_CASHBACKINFO_SUCCESS,
            response: commonSuccessData,
            params: {
              receiptNumber: '123456',
              source: 'RECEIPT',
            },
          },
        ];
        return expectedActionsCheck(actions.getCashbackInfo(receiptNumber), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACKINFO_REQUEST },
          { type: types.FETCH_CASHBACKINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.getCashbackInfo(receiptNumber), expectedActions);
      });
    });

    describe('createCashbackInfo', () => {
      const reqParams = {
        receiptNumber: '0031912111604413',
        phone: '+8618813096217',
        source: 'RECEIPT',
        registrationSource: 'BeepStore',
        registrationTouchpoint: 'OnlineOrder',
      };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.CREATE_CASHBACKINFO_REQUEST },
          { type: types.CREATE_CASHBACKINFO_SUCCESS, response: commonSuccessData, params: reqParams },
        ];
        return expectedActionsCheck(actions.createCashbackInfo(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.CREATE_CASHBACKINFO_REQUEST },
          { type: types.CREATE_CASHBACKINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.createCashbackInfo(reqParams), expectedActions);
      });
    });

    describe('getCashbackReceiptNumber', () => {
      const hash = 'U6Sqv+j2F7Gov+7za5OM2eC1X5z9MDy3o2h6ZkVVTNA=';
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_RECEIPTNUMBER_REQUEST },
          { type: types.FETCH_RECEIPTNUMBER_SUCCESS, response: commonSuccessData, params: {} },
        ];
        return expectedActionsCheck(actions.getCashbackReceiptNumber(hash), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_RECEIPTNUMBER_REQUEST },
          { type: types.FETCH_RECEIPTNUMBER_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.getCashbackReceiptNumber(hash), expectedActions);
      });
    });
  });
});
