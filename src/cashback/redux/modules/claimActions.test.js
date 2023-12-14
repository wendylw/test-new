import { actions } from './claim';
import { CLAIM_TYPES as types } from '../types';
import { store, successMockFetch, expectedActionsCheck, commonSuccessData } from '../../../utils/testHelper';

jest.mock('../../../common/utils/__mocks__/inobounce.js');

describe('src/cashback/redux/modules/claims.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
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
    });
  });
});
