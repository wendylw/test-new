import homeReducers, { initialState, getShoppingCart } from './home';
import rootReducer from './index';
import { HOME_TYPES as types } from '../types';
import { getReducerNewState, configureMiddlewareStore, expectedActionsCheck } from '../../../utils/testHelper';

import {
  isFetched,
  getCartItemIds,
  getCartUnavailableItemIds,
  getCurrentProduct,
  getCartItemList,
  isVerticalMenuBusiness,
  getShoppingCart as getShoppingCartSelector,
  getShoppingCartItemsByProducts as getShoppingCartItemsByProductsSelector,
  getCategoryProductList as getCategoryProductListSelector,
} from './home';

import {
  fetchShoppingCartData,
  fetchOnlineCategoryData,
  getAllProductsParams,
  getAllCategoriesParams,
  getCartItemListParams,
  getCategoryProductListResult,
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
describe('src/ordering/redux/modules/home: selectors', () => {
  const itemIds = ['1a', '3c'];
  const carts = {
    '1a': { id: 1, productId: '123', variations: [], quantity: 11 },
    '2b': {
      id: 2,
      productId: '456',
      quantity: 22,
      variations: [
        { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87867', markedSoldOut: false },
      ],
    },
    '3c': {
      id: 3,
      productId: '789',
      quantity: 33,
      variations: [
        { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87868', markedSoldOut: false },
      ],
    },
  };
  const state = rootReducer(undefined, { type: null });
  it('isFetched', () => {
    expect(isFetched(state)).toEqual(undefined);
  });
  it('getCartItemIds', () => {
    expect(getCartItemIds(state)).toEqual([]);
  });
  it('getCartUnavailableItemIds', () => {
    expect(getCartUnavailableItemIds(state)).toEqual([]);
  });
  it('getCurrentProduct', () => {
    expect(getCurrentProduct(state)).toEqual({ id: '', cartId: '', isFetching: false });
  });
  it('getCartItemList', () => {
    expect(getCartItemList(state)).toEqual([]);
  });
  it('isVerticalMenuBusiness', () => {
    expect(isVerticalMenuBusiness(state)).toEqual(true);
  });
  it('getShoppingCart', () => {
    const mockParams = {
      summary: '100',
      itemIds,
      unavailableItemIds: ['2b'],
      carts,
    };
    const selectorFunc = getShoppingCartSelector.resultFunc(
      mockParams.summary,
      mockParams.itemIds,
      mockParams.unavailableItemIds,
      mockParams.carts
    );
    const expectedResult = {
      summary: '100',
      items: [
        { id: 1, productId: '123', variations: [], quantity: 11 },
        {
          id: 3,
          productId: '789',
          quantity: 33,
          variations: [
            { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87868', markedSoldOut: false },
          ],
        },
      ],
      unavailableItems: [
        {
          id: 2,
          productId: '456',
          quantity: 22,
          variations: [
            { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87867', markedSoldOut: false },
          ],
        },
      ],
    };
    expect(selectorFunc).toEqual(expectedResult);
  });

  it('getShoppingCartItemsByProducts', () => {
    const mockParams = {
      itemIds,
      carts,
      product: { id: '789' },
    };
    const selectorFunc = getShoppingCartItemsByProductsSelector.resultFunc(
      mockParams.itemIds,
      mockParams.carts,
      mockParams.product
    );
    const expectedResult = {
      count: 33,
      items: [
        {
          productId: '789',
          variations: [
            {
              markedSoldOut: false,
              optionId: '5de4ca9a8f1b5f2526c87868',
              variationId: '5de4ca9a8f1b5f2526c87866',
            },
          ],
        },
      ],
    };
    expect(selectorFunc).toEqual(expectedResult);
  });
  it('getCategoryProductList', () => {
    const mockParams = {
      products: getAllProductsParams,
      categories: getAllCategoriesParams,
      carts: getCartItemListParams,
    };
    const selectorFunc = getCategoryProductListSelector.resultFunc(
      mockParams.products,
      mockParams.categories,
      mockParams.carts
    );
    const expectedResult = getCategoryProductListResult;
    expect(selectorFunc).toEqual(expectedResult);
  });
});
