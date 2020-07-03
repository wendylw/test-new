import onlineStoresReducer from './onlineStores';

describe('src/redux/modules/entities/onlineStores.js:reducers', () => {
  it('should return the initial state', () => {
    expect(onlineStoresReducer(undefined, {})).toEqual({});
  });
  it('action with resonseGql', () => {
    const action = {
      type: 'whatever',
      responseGql: {
        data: {
          onlineStoreInfo: {
            id: '5de726067ed3949af8fdd117',
            storeName: null,
            logo: null,
            favicon: null,
            locale: 'MS-MY',
            currency: 'MYR',
            currencySymbol: 'RM',
            country: 'MY',
            state: null,
            street: null,
          },
        },
      },
    };
    const expectedState = {
      '5de726067ed3949af8fdd117': {
        id: '5de726067ed3949af8fdd117',
        storeName: null,
        logo: null,
        favicon: null,
        locale: 'MS-MY',
        currency: 'MYR',
        currencySymbol: 'RM',
        country: 'MY',
        state: null,
        street: null,
      },
    };
    expect(onlineStoresReducer({}, action)).toEqual(expectedState);
  });
  it('action with no valid responseGql', () => {
    const action = {
      type: 'whatever',
    };
    const action2 = {
      type: 'whatever',
      responseGql: { data: {} },
    };
    expect(onlineStoresReducer({}, action)).toEqual({});
    expect(onlineStoresReducer({}, action2)).toEqual({});
  });
});
