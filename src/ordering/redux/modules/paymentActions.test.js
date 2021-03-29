import { actions, types, initialState } from './payment';
import { APP_TYPES } from '../types';
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
const orderingStore = rootReducer(undefined, {});

describe('src/ordering/redux/modules/payment.js: actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('Async Action Creators', () => {
    const caseStore = configureMiddlewareStore(orderingStore);
    describe('createOrder', () => {
      it('Success', () => {
        successMockFetch();

        const expectedActions = [
          { type: types.CREATEORDER_REQUEST },
          { type: types.CREATEORDER_SUCCESS, responseGql: commonSuccessData },
        ];
        return caseStore.dispatch(actions.createOrder({ cashback: '100' })).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it('Fail', () => {
        caseStore.clearActions();
        failMockFetch();
        const expectedActions = [
          { type: types.CREATEORDER_REQUEST },
          { type: types.CREATEORDER_FAILURE, code: mockErrorCode, message: mockErrorMsg },
          { type: APP_TYPES.SHOW_ERROR, code: 401, message: undefined },
        ];
        return caseStore.dispatch(actions.createOrder({ cashback: '100' })).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
  });
});
