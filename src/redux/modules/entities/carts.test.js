import cartsReducer, { initialState, getAllCartItems, getCartItemById, getCartSummary } from './carts';
import { APP_TYPES, HOME_TYPES } from '../../../ordering/redux/types';
import mockState from '../../__fixtures__/state.fixture';

describe('src/redux/modules/entities/carts.js:reducers', () => {
  const actionInfo = {
    responseGql: {
      data: {
        emptyShoppingCart: {
          success: true,
        },
      },
    },
  };
  it('should return the initial state', () => {
    expect(cartsReducer(undefined, {})).toEqual(initialState);
  });
  describe('action parameters', () => {
    it('action with responseGql', () => {
      const action = {
        type: null,
        responseGql: {
          ...actionInfo.responseGql,
        },
      };
      const expectedState = {
        ...initialState,
        summary: initialState.summary,
        data: {},
      };
      const newState = cartsReducer({ ...initialState }, action);
      expect(newState).toEqual(expectedState);
    });
    it('actionType:APP_TYPES.FETCH_CUSTOMER_PROFILE_SUCCESS', () => {
      const action = {
        type: APP_TYPES.FETCH_CUSTOMER_PROFILE_SUCCESS,
        response: {
          storeCreditsBalance: 'mockStoreCreditsBalance',
        },
      };
      const expectedState = {
        ...initialState,
        summary: {
          ...initialState.summary,
          storeCreditsBalance: 'mockStoreCreditsBalance',
        },
      };
      const newState = cartsReducer({ ...initialState }, action);
      expect(newState).toEqual(expectedState);
    });
    describe('actionType:HOME_TYPES.FETCH_SHOPPINGCART_SUCCESS', () => {
      const type = HOME_TYPES.FETCH_SHOPPINGCART_SUCCESS;
      it('action no response', () => {
        const action = { type };
        expect(cartsReducer({ ...initialState }, action)).toEqual({ ...initialState });
      });
      it('action with resonse', () => {
        const summary = {
          total: 50,
          subtotal: 50,
          count: 2,
          discount: 0,
          tax: 0,
          serviceCharge: 0,
          serviceChargeTax: 0,
          loyaltyDiscounts: null,
        };
        const response = {
          ...summary,
          items: [
            {
              id: '1a5fb008266358952206ca9fa8927f95',
              productId: '5de720aee872af6ab28a6ca3',
              parentProductId: null,
              title: 'Latte',
              variationTexts: ['cold'],
              variations: [
                {
                  variationId: '5de720aee872af6ab28a6ca4',
                  optionId: '5de720aee872af6ab28a6ca6',
                  markedSoldOut: false,
                },
              ],
              markedSoldOut: false,
              displayPrice: 25,
              quantity: 2,
              image:
                'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
            },
          ],
          unavailableItems: [],
        };
        const action = {
          type,
          response,
        };
        const expectedState = {
          ...initialState,
          summary,
          data: {
            '1a5fb008266358952206ca9fa8927f95': {
              id: '1a5fb008266358952206ca9fa8927f95',
              productId: '5de720aee872af6ab28a6ca3',
              parentProductId: null,
              title: 'Latte',
              variationTexts: ['cold'],
              variations: [
                {
                  variationId: '5de720aee872af6ab28a6ca4',
                  optionId: '5de720aee872af6ab28a6ca6',
                  markedSoldOut: false,
                },
              ],
              markedSoldOut: false,
              displayPrice: 25,
              quantity: 2,
              image:
                'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
              _available: true,
            },
          },
        };
        const newState = cartsReducer({ ...initialState }, action);
        expect(newState).toEqual(expectedState);
      });
    });
  });
});

describe('src/redux/modules/entities/carts.js:selectors', () => {
  it('getAllCartItems', () => {
    const pieceState = getAllCartItems(mockState);
    expect(pieceState).toEqual(mockState.entities.carts.data);
  });

  it('getCartItemById', () => {
    const pieceState = getCartItemById(mockState, '1a5fb008266358952206ca9fa8927f95');
    const expectedState = {
      id: '1a5fb008266358952206ca9fa8927f95',
      productId: '5de720aee872af6ab28a6ca3',
      parentProductId: null,
      title: 'Latte',
      variationTexts: ['cold'],
      variations: [
        {
          variationId: '5de720aee872af6ab28a6ca4',
          optionId: '5de720aee872af6ab28a6ca6',
          markedSoldOut: false,
        },
      ],
      markedSoldOut: false,
      displayPrice: 25,
      quantity: 2,
      image:
        'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
      _available: true,
    };
    expect(pieceState).toEqual(expectedState);
  });

  it('getCartSummary', () => {
    const pieceState = getCartSummary(mockState);
    expect(pieceState).toEqual(mockState.entities.carts.summary);
  });
});
