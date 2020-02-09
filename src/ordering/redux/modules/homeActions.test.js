import { actions, initialState, fetchShoppingCart, fetchOnlineCategory } from './home';
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

  describe('Async Action Creators', () => {
    describe('loadProductList', () => {
      it('should direction return', () => {
        const caseStore = configureMiddlewareStore({ home: { onlineCategory: { categoryIds: [] } } });
        expect(actions.loadProductList()(caseStore.dispatch, caseStore.getState)).toEqual(undefined);
      });
      it('fetchOnlineCategory', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINECATEGORY_REQUEST },
          { type: types.FETCH_ONLINECATEGORY_SUCCESS, responseGql: commonSuccessData },
        ];
        expectedActionsCheck(fetchOnlineCategory(), expectedActions);
      });
    });
    describe('loadShoppingCart', () => {
      successMockFetch();
      store.clearActions();
      const expectedActions = [
        { type: types.FETCH_SHOPPINGCART_REQUEST },
        { type: types.FETCH_SHOPPINGCART_SUCCESS, response: commonSuccessData, params: {} },
      ];
      return expectedActionsCheck(fetchShoppingCart(), expectedActions);
    });
    describe('removeShoppingCartItem', () => {
      it(':Success', () => {
        store.clearActions();
        successMockFetch();
        const expectedActions = [
          { type: types.REMOVE_SHOPPINGCARTITEM_REQUEST },
          { type: types.REMOVE_SHOPPINGCARTITEM_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.removeShoppingCartItem({}), expectedActions);
      });
    });
    describe('addOrUpdateShoppingCartItem', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST },
          { type: types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS, responseGql: commonSuccessData },
        ];
        const reqParams = {};
        return expectedActionsCheck(actions.addOrUpdateShoppingCartItem(reqParams), expectedActions);
      });
    });
    describe('decreaseProductInCart', () => {
      it('should dispatch removeShoppingCartItem', () => {
        successMockFetch();

        const expectedActions = [
          { type: types.REMOVE_SHOPPINGCARTITEM_REQUEST },
          { type: types.REMOVE_SHOPPINGCARTITEM_SUCCESS, responseGql: commonSuccessData },
        ];
        const cloneProduct = JSON.parse(JSON.stringify(productParams));
        cloneProduct.id = '5de4dc12f90ac02b38b93f28';

        return expectedActionsCheck(
          actions.decreaseProductInCart(fetchShoppingCartData, cloneProduct),
          expectedActions
        );
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
        cloneProduct.id = '5de4dc12f90ac02b38b93f28';
        cloneProduct.cartQuantity = 2;
        return caseStore.dispatch(actions.decreaseProductInCart(fetchShoppingCartData, cloneProduct)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
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
