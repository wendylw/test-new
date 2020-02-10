import homeReducers, { initialState } from './home';
import rootReducer from './index';
import { HOME_TYPES as types } from '../types';
import { getReducerNewState, configureMiddlewareStore } from '../../../utils/testHelper';

import {
  getShoppingCart as getShoppingCartSelector,
  getCategoryProductList as getCategoryProductListSelector,
} from './home';

import { getShoppingCartSelectorResult, getCategoryProductListSelectorResult } from '../__fixtures__/home.fixture';
const orderingState = rootReducer(undefined, {});

describe('src/ordering/redux/modules/home.js:reducers', () => {
  it('should return the initial state', () => {
    expect(homeReducers(undefined, {})).toEqual(initialState);
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
