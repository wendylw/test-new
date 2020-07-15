import { actions, types } from './home';
import rootReducer from './index';
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

const mockState = rootReducer(undefined, {});

describe('src/stores/redux/modules/home.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
    describe('loadCoreStores', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(mockState);
        const expectedActions = [
          { type: types.FETCH_CORESTORES_REQUEST },
          { type: types.FETCH_CORESTORES_SUCCESS, responseGql: commonSuccessData },
        ];
        return caseStore.dispatch(actions.loadCoreStores()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(mockState);
        const expectedActions = [
          { type: types.FETCH_CORESTORES_REQUEST },
          { type: types.FETCH_CORESTORES_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.loadCoreStores()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('getStoreHashData', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_STORE_HASHCODE_REQUEST },
          { type: types.FETCH_STORE_HASHCODE_SUCCESS, response: commonSuccessData, params: {} },
        ];
        return expectedActionsCheck(actions.getStoreHashData('123'), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.FETCH_STORE_HASHCODE_REQUEST,
          },
          {
            type: types.FETCH_STORE_HASHCODE_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.getStoreHashData('1213'), expectedActions);
      });
    });
  });
});
