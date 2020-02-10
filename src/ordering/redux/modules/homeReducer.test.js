import homeReducers, { initialState } from './home';
import rootReducer from './index';
import { HOME_TYPES as types } from '../types';
import { getReducerNewState, configureMiddlewareStore, expectedActionsCheck } from '../../../utils/testHelper';

import {
  getShoppingCart as getShoppingCartSelector,
  getCategoryProductList as getCategoryProductListSelector,
} from './home';

import {
  fetchShoppingCartData,
  fetchOnlineCategoryData,
  getShoppingCartSelectorResult,
  getCategoryProductListSelectorResult,
} from '../__fixtures__/home.fixture';
const orderingState = rootReducer(undefined, {});

describe('src/ordering/redux/modules/home.js:reducers', () => {
  it('should return the initial state', () => {
    expect(homeReducers(undefined, {})).toEqual(initialState);
  });
  describe('domProperties', () => {
    expect(getReducerNewState(homeReducers, { type: null }, 'domProperties')).toEqual({
      ...initialState.domProperties,
    });
  });
  describe('currentProduct', () => {
    const nameField = 'currentProduct';
    const currentProductActionInfo = {
      responseGql: {
        data: { product: { id: '123456' } },
      },
    };
    it('FETCH_PRODUCTDETAIL_REQUEST', () => {
      const action = { type: types.FETCH_PRODUCTDETAIL_REQUEST };
      const expectedState = { ...initialState.currentProduct, isFetching: true };
      expect(getReducerNewState(homeReducers, action, nameField)).toEqual(expectedState);
    });
    it('FETCH_PRODUCTDETAIL_SUCCESS', () => {
      const action = {
        type: types.FETCH_PRODUCTDETAIL_SUCCESS,
        ...currentProductActionInfo,
      };
      const expectedState = { ...initialState.currentProduct, isFetching: false, id: '123456' };
      expect(getReducerNewState(homeReducers, action, nameField)).toEqual(expectedState);
    });
    it('default', () => {
      expect(getReducerNewState(homeReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.currentProduct,
      });
    });
  });
  describe('shoppingCart', () => {
    const nameField = 'shoppingCart';
    let cloneFetchShoppingCartData = JSON.parse(JSON.stringify(fetchShoppingCartData));
    const shoppingCartActionInfo = {
      response: cloneFetchShoppingCartData,
    };

    it('should return state with empty itemIds', () => {
      const shoppingCartActionInfo = {
        responseGql: {
          data: {
            emptyShoppingCart: {
              success: true,
            },
          },
        },
      };
      const expectedState = {
        ...initialState.shoppingCart,
        isFetching: false,
        itemIds: [],
        unavailableItemIds: [],
      };
      const action = { type: null, responseGql: shoppingCartActionInfo };
      expect(getReducerNewState(homeReducers, action, nameField)).toEqual(expectedState);
    });
    it('FETCH_SHOPPINGCART_REQUEST', () => {
      expect(getReducerNewState(homeReducers, { type: types.FETCH_SHOPPINGCART_REQUEST }, nameField)).toEqual({
        ...initialState.shoppingCart,
        isFetching: true,
      });
    });
    it('FETCH_SHOPPINGCART_SUCCESS', () => {
      const action = {
        type: types.FETCH_SHOPPINGCART_SUCCESS,
        ...shoppingCartActionInfo,
      };
      const expectedState = {
        ...initialState.shoppingCart,
        isFetching: false,
        itemIds: [
          'd79db2cd92d785e5d4c07e046052bb34',
          '41f0bafe441a059d8f76f2c966732b85',
          '3c81558b01e1c770b6442b9fd0f6d763',
        ],
        unavailableItemIds: [],
      };
      expect(getReducerNewState(homeReducers, action, nameField)).toEqual(expectedState);
    });
    it('FETCH_SHOPPINGCART_FAILURE', () => {
      expect(getReducerNewState(homeReducers, { type: types.FETCH_SHOPPINGCART_FAILURE }, nameField)).toEqual({
        ...initialState.shoppingCart,
        isFetching: false,
      });
    });
    it('default', () => {
      expect(getReducerNewState(homeReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.shoppingCart,
      });
    });
  });
  describe('onlineCategory', () => {
    const nameField = 'onlineCategory';
    it('FETCH_ONLINECATEGORY_REQUEST', () => {
      expect(getReducerNewState(homeReducers, { type: types.FETCH_ONLINECATEGORY_REQUEST }, nameField)).toEqual({
        ...initialState.onlineCategory,
        isFetching: true,
      });
    });
    it('FETCH_ONLINECATEGORY_SUCCESS', () => {
      const action = {
        type: types.FETCH_ONLINECATEGORY_SUCCESS,
        responseGql: fetchOnlineCategoryData,
      };
      const expectedState = {
        ...initialState.onlineCategory,
        isFetching: false,
        categoryIds: ['5da845cf2d7b4244276bddb2', '5cdce13be5fea1125c716dd5', '5cd159c1fb012d7c4b1c9f9d'],
      };
      expect(getReducerNewState(homeReducers, action, nameField)).toEqual(expectedState);
    });
    it('FETCH_ONLINECATEGORY_FAILURE', () => {
      expect(getReducerNewState(homeReducers, { type: types.FETCH_ONLINECATEGORY_FAILURE }, nameField)).toEqual({
        ...initialState.onlineCategory,
        isFetching: false,
      });
    });
    it('default', () => {
      expect(getReducerNewState(homeReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.onlineCategory,
      });
    });
  });
});
// describe('src/ordering/redux/modules/home: selectors', () => {
//   const caseStore = configureMiddlewareStore(orderingState);
//   it('getShoppingCart', () => {
//     const getShoppingCartRes = getShoppingCartSelector(caseStore.getState());
//     expect(getShoppingCartRes).toEqual(getShoppingCartSelectorResult);
//   });
//     it('getCategoryProductList', () => {
//       const getCategoryProductListRes = getCategoryProductListSelector(selectorStore.getState());
//       expect(getCategoryProductListRes).toEqual(getCategoryProductListSelectorResult);
//     });
// });
