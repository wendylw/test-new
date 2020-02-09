import { actions, initialState } from './home';
import rootReducer from './index';
import { HOME_TYPES as types } from '../types';
import {
  fetchShoppingCartData,
  fetchOnlineCategoryData,
  RemoveShoppingCartItemData,
  AddOrUpdateShoppingCartItemData,
  fetchProductDetailData,
  productParams,
  getShoppingCartSelectorResult,
  getCategoryProductListSelectorResult,
} from '../__fixtures__/home.fixture';
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
  //   describe('action creators', () => {
  //     it('loadProductList', () => {
  //       const expectedAction = {
  //         type: types.SHOW_LOGIN_PAGE,
  //       };
  //       return expect(actions.showLogin()).toEqual(expectedAction);
  //     });
  //   });
  describe('Async Action Creators', () => {
    describe('increaseProductInCart', () => {
      it('should direction return', () => {
        const caseStore = configureMiddlewareStore({ home: { currentProduct: { id: '5dbfcc7f637055227dd94e58' } } });
        expect(actions.increaseProductInCart(productParams)(caseStore.dispatch, caseStore.getState)).toEqual(undefined);
      });
      it('should dispatch fetchProductDetail', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          {
            type: types.FETCH_PRODUCTDETAIL_REQUEST,
          },
          {
            type: types.FETCH_PRODUCTDETAIL_SUCCESS,
            responseGql: commonSuccessData,
          },
        ];

        return caseStore.dispatch(actions.increaseProductInCart(productParams)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it('should dispatch addOrUpdateShoppingCartItem', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);

        const expectedActions = [
          {
            type: types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST,
          },
          {
            type: types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS,
            responseGql: commonSuccessData,
          },
        ];
        const cloneProduct = JSON.parse(JSON.stringify(productParams));
        delete cloneProduct.variations;
        return caseStore.dispatch(actions.increaseProductInCart(cloneProduct)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('loadProductDetail', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          {
            type: types.FETCH_PRODUCTDETAIL_REQUEST,
          },
          {
            type: types.FETCH_PRODUCTDETAIL_SUCCESS,
            responseGql: commonSuccessData,
          },
        ];
        return expectedActionsCheck(actions.loadProductDetail(productParams), expectedActions);
      });
    });
  });
});
