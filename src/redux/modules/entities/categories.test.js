import categoriesReducer, { getAllCategories } from './categories';
import mockState from '../../__fixtures__/state.fixture';
import mockResponseGql from '../../__fixtures__/responseGql.fixture';

describe('src/redux/modules/entities/categories.js:reducers', () => {
  describe('action parameter', () => {
    describe('action with responseGql', () => {
      it('responseGql with no valid onlineCategory', () => {
        const action = {
          responseGql: { data: {} },
        };
        const newState = categoriesReducer({}, action);
        expect(newState).toEqual({});
      });
      it('responseGql has valid onlineCategory', () => {
        const action = {
          responseGql: mockResponseGql,
        };
        const expectedState = {
          '5de72606e8fb5d6ac10fe39c': {
            id: '5de72606e8fb5d6ac10fe39c',
            name: 'All',
            isEnabled: true,
            products: [
              '5e12b3f2ed43e34e37874636',
              '5de720aee872af6ab28a6ca3',
              '5de72ec75234055a77249c19',
              '5e12bd73ed43e34e37874640',
              '5de7304b5234055a7724a4e1',
            ],
          },
          '5de732c45234055a7724a9d9': {
            id: '5de732c45234055a7724a9d9',
            name: 'coffee',
            isEnabled: true,
            products: ['5de720aee872af6ab28a6ca3', '5de72ec75234055a77249c19', '5e12bd73ed43e34e37874640'],
          },
          '5de733315234055a7724a9e1': {
            id: '5de733315234055a7724a9e1',
            name: 'tea',
            isEnabled: true,
            products: ['5de7304b5234055a7724a4e1'],
          },
        };
        const newState = categoriesReducer({}, action);
        expect(newState).toEqual(expectedState);
      });
    });
    it('action with no responseGql', () => {
      expect(categoriesReducer({}, { type: null })).toEqual({});
    });
  });
});
describe('src/redux/modules/entities/categories.js:selectors', () => {
  it('getAllCategories', () => {
    expect(getAllCategories(mockState)).toEqual(mockState.entities.categories);
  });
});
