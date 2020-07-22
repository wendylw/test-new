import { actions } from './cart';
import rootReducer from './index';
import { CART_TYPES as types } from '../types';
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

describe('src/ordering/redux/modules/cart.js: actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('Async Action Creators', () => {
    describe('clearAll', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          {
            type: types.CLEARALL_REQUEST,
          },
          {
            type: types.CLEARALL_SUCCESS,
            responseGql: commonSuccessData,
          },
        ];
        return expectedActionsCheck(actions.clearAll(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.CLEARALL_REQUEST,
          },
          {
            type: types.CLEARALL_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.clearAll(), expectedActions);
      });
    });
    describe('clearAllByProducts', () => {
      const reqParams = [{ id: '1' }, { id: '2' }];
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.CLEARALL_BY_PRODUCTS_REQUEST },
          {
            type: types.CLEARALL_BY_PRODUCTS_SUCCESS,
            response: commonSuccessData,
            params: { '0': { id: '1' }, '1': { id: '2' } },
          },
        ];
        return expectedActionsCheck(actions.clearAllByProducts(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.CLEARALL_BY_PRODUCTS_REQUEST,
          },
          {
            type: types.CLEARALL_BY_PRODUCTS_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.clearAllByProducts(reqParams), expectedActions);
      });
    });
    describe('loadPendingPaymentList', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_PENDING_TRANSACTIONS_REQUEST },
          { type: types.FETCH_PENDING_TRANSACTIONS_SUCCESS, response: commonSuccessData, params: {} },
        ];
        return expectedActionsCheck(actions.loadPendingPaymentList(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_PENDING_TRANSACTIONS_REQUEST },
          {
            type: types.FETCH_PENDING_TRANSACTIONS_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.loadPendingPaymentList(), expectedActions);
      });
    });
    describe('updateTransactionsStatus', () => {
      const reqParams = {
        status: 'ok',
        receiptNumbers: '123456',
      };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.UPDATE_TRANSACTIONS_STATUS_REQUEST },
          { type: types.UPDATE_TRANSACTIONS_STATUS_SUCCESS, response: commonSuccessData, params: reqParams },
        ];
        return expectedActionsCheck(actions.updateTransactionsStatus(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.UPDATE_TRANSACTIONS_STATUS_REQUEST },
          {
            type: types.UPDATE_TRANSACTIONS_STATUS_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.updateTransactionsStatus(reqParams), expectedActions);
      });
    });
  });
});
