import productReducers, { getAllProducts, getProductById } from './products';
import mockState from '../../__fixtures__/state.fixture';
import responseGql from '../../__fixtures__/responseGql.fixture';

describe('src/redux/modules/entities/products.js:reducers', () => {
  it('should return the initial state', () => {
    expect(productReducers(undefined, {})).toEqual({});
  });
  it('action with responseGql:has onlineCategory', () => {
    const action = {
      type: 'whatever',
      responseGql,
    };
    const expectedState = {
      '5de720aee872af6ab28a6ca3': {
        _needMore: 2,
        displayPrice: 25,
        id: '5de720aee872af6ab28a6ca3',
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
        ],
        isFeaturedProduct: true,
        markedSoldOut: false,
        title: 'Latte',
        trackInventory: false,
        variations: [
          {
            id: '5de720aee872af6ab28a6ca4',
            name: 'temperature',
            optionValues: [
              { id: '5de720aee872af6ab28a6ca6', markedSoldOut: false, value: 'cold' },
              { id: '5de720aee872af6ab28a6ca5', markedSoldOut: false, value: 'hot' },
            ],
            variationType: 'SingleChoice',
          },
          {
            id: '5e12b3e2ed43e34e37874632',
            name: 'multiple tesrt',
            optionValues: [
              { id: '5e12b3e2ed43e34e37874634', markedSoldOut: false, value: '1' },
              { id: '5e12b3e2ed43e34e37874633', markedSoldOut: false, value: '2' },
            ],
            variationType: 'MultipleChoice',
          },
        ],
      },
      '5de72ec75234055a77249c19': {
        _needMore: 1,
        displayPrice: 22,
        id: '5de72ec75234055a77249c19',
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de72ec75234055a77249c19/4e731a07-a81f-4507-ae4c-b293bca3fc52',
        ],
        isFeaturedProduct: true,
        markedSoldOut: false,
        title: 'cappuccino',
        trackInventory: false,
        variations: [
          {
            id: '5de72ec75234055a77249c1a',
            name: 'Temperature',
            optionValues: [
              { id: '5de72ec75234055a77249c1c', markedSoldOut: false, value: 'cold' },
              { id: '5de72ec75234055a77249c1b', markedSoldOut: false, value: 'hot' },
            ],
            variationType: 'SingleChoice',
          },
        ],
      },
      '5de7304b5234055a7724a4e1': {
        _needMore: 0,
        displayPrice: 15,
        id: '5de7304b5234055a7724a4e1',
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de7304b5234055a7724a4e1/251a3219-b3af-461f-ba28-4db4a55b6316',
        ],
        isFeaturedProduct: true,
        markedSoldOut: false,
        title: 'red tea',
        trackInventory: false,
        variations: [],
      },
      '5e12b3f2ed43e34e37874636': {
        _needMore: 1,
        displayPrice: 40,
        id: '5e12b3f2ed43e34e37874636',
        images: [],
        isFeaturedProduct: true,
        markedSoldOut: false,
        title: 'test',
        trackInventory: false,
        variations: [
          {
            id: '5e12b6caed43e34e3787463c',
            name: 'multipletest',
            optionValues: [
              { id: '5e12b6caed43e34e3787463e', markedSoldOut: false, value: '11' },
              { id: '5e12b6caed43e34e3787463d', markedSoldOut: false, value: '22' },
            ],
            variationType: 'MultipleChoice',
          },
        ],
      },
      '5e12bd73ed43e34e37874640': {
        _needMore: 1,
        displayPrice: 20,
        id: '5e12bd73ed43e34e37874640',
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5e12bd73ed43e34e37874640/21c3fd76-9f9c-4ce8-b558-9943ce239a94',
        ],
        isFeaturedProduct: true,
        markedSoldOut: false,
        title: 'newCoffee',
        trackInventory: false,
        variations: [
          {
            id: '5e12bd73ed43e34e37874641',
            name: 'test1',
            optionValues: [
              { id: '5e12bd73ed43e34e37874643', markedSoldOut: false, value: 't1' },
              { id: '5e12bd73ed43e34e37874642', markedSoldOut: false, value: 't2' },
            ],
            variationType: 'SingleChoice',
          },
        ],
      },
    };
    expect(productReducers({}, action)).toEqual(expectedState);
  });
  describe('action with responseGql:has product', () => {
    const action = {
      type: 'whatever',
      responseGql: {
        data: {
          product: {
            id: '5e12b3f2ed43e34e37874636',
            title: 'test',
          },
        },
      },
    };
    const expectedState = {
      '5e12b3f2ed43e34e37874636': {
        id: '5e12b3f2ed43e34e37874636',
        title: 'test',
      },
    };
    it('state is initial', () => {
      expect(productReducers({}, action)).toEqual(expectedState);
    });
    it('state include productid', () => {
      const originalState = {
        '5e12b3f2ed43e34e37874636': {
          id: '5e12b3f2ed43e34e37874636',
          title: 'test',
        },
      };
      expect(productReducers(originalState, action)).toEqual({
        '5e12b3f2ed43e34e37874636': {
          id: '5e12b3f2ed43e34e37874636',
          title: 'test',
          _needMore: false,
        },
      });
    });
  });
});

describe('src/redux/modules/entities/products.js:selectors', () => {
  it('getAllBusinesses', () => {
    expect(getAllProducts(mockState)).toEqual(mockState.entities.products);
  });
  it('getLoyaltyHistoriesByCustomerId', () => {
    expect(getProductById(mockState, '5e12b3f2ed43e34e37874636')).toEqual({
      id: '5e12b3f2ed43e34e37874636',
      title: 'test',
      displayPrice: 40,
      trackInventory: false,
      images: [],
      markedSoldOut: false,
      variations: [
        {
          id: '5e12b6caed43e34e3787463c',
          name: 'multipletest',
          variationType: 'MultipleChoice',
          optionValues: [
            {
              markedSoldOut: false,
              id: '5e12b6caed43e34e3787463e',
              value: '11',
            },
            {
              markedSoldOut: false,
              id: '5e12b6caed43e34e3787463d',
              value: '22',
            },
          ],
        },
      ],
      isFeaturedProduct: true,
      _needMore: 1,
    });
  });
});
