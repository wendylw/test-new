import { actions, types, initialState } from './payment';
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
  describe('action creators', () => {
    it('setCurrentPayment', () => {
      const expectedAction = {
        type: types.SET_CURRENT_PAYMENT,
        paymentName: 'mockPaymentName',
      };
      return expect(actions.setCurrentPayment('mockPaymentName')).toEqual(expectedAction);
    });
    it('clearBraintreeToken', () => {
      const expectedAction = {
        type: types.CLEAR_BRAINTREE_TOKEN,
      };
      return expect(actions.clearBraintreeToken()).toEqual(expectedAction);
    });
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
        ];
        return caseStore.dispatch(actions.createOrder({ cashback: '100' })).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('fetchOrder', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ORDER_REQUEST },
          { type: types.FETCH_ORDER_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.fetchOrder('123456'), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_ORDER_REQUEST },
          { type: types.FETCH_ORDER_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchOrder('123456'), expectedActions);
      });
    });

    describe('fetchBraintreeToken', () => {
      const paymentName = 'mockPaymentName';
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_BRAINTREE_TOKEN_REQUEST },
          { type: types.FETCH_BRAINTREE_TOKEN_SUCCESS, response: commonSuccessData, params: { paymentName } },
        ];
        return expectedActionsCheck(actions.fetchBraintreeToken(paymentName), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_BRAINTREE_TOKEN_REQUEST },
          { type: types.FETCH_BRAINTREE_TOKEN_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchBraintreeToken(paymentName), expectedActions);
      });
    });

    describe('fetchBankList', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_BANKLIST_REQUEST },
          { type: types.FETCH_BANKLIST_SUCCESS, response: commonSuccessData, params: {} },
        ];
        return expectedActionsCheck(actions.fetchBankList(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_BANKLIST_REQUEST },
          { type: types.FETCH_BANKLIST_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchBankList(), expectedActions);
      });
    });
  });
});
