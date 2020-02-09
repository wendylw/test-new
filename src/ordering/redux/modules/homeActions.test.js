import { actions } from './home';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import {
  store,
  configureMiddlewareStore,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';

const orderingStore = rootReducer(undefined, {});

describe('src/ordering/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('action creators', () => {
    it('showLogin', () => {
      const expectedAction = {
        type: types.SHOW_LOGIN_PAGE,
      };
      return expect(actions.showLogin()).toEqual(expectedAction);
    });
  });
  describe('Async Action Creators', () => {
    describe('fetchOnlineStoreInfo', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
    });
  });
});
