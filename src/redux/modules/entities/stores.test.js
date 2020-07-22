import storeReducers, { getAllStores, getStoreById } from './stores';
import mockState from '../../__fixtures__/state.fixture';

describe('src/redux/modules/entities/stores.js:reducers', () => {
  it('should return the initial state', () => {
    expect(storeReducers(undefined, {})).toEqual({});
  });
  describe('action with responseGql', () => {
    it('valid business and stores', () => {
      const businessInfo = {
        name: 'mockName',
        stores: [
          {
            id: '5de71ef1e872af6ab28a6c74',
            name: 'coffee',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'universe',
            state: 'normal',
          },
          {
            id: '5de72d57e872af6ab28a7809',
            name: 'Mercy',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'my',
            state: 'normal',
          },
        ],
      };
      const action = {
        type: 'whatever',
        responseGql: {
          data: {
            business: businessInfo,
          },
        },
      };
      const expectedState = {
        '5de71ef1e872af6ab28a6c74': {
          id: '5de71ef1e872af6ab28a6c74',
          name: 'coffee',
          isOnline: true,
          isDeleted: null,
          street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
          street2: '',
          city: 'universe',
          state: 'normal',
        },
        '5de72d57e872af6ab28a7809': {
          id: '5de72d57e872af6ab28a7809',
          name: 'Mercy',
          isOnline: true,
          isDeleted: null,
          street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
          street2: '',
          city: 'my',
          state: 'normal',
        },
      };
      expect(storeReducers({}, action)).toEqual(expectedState);
    });
    it('no valid business', () => {
      const action = {
        type: 'what',
        responseGql: {
          data: {},
        },
      };
      expect(storeReducers({}, action)).toEqual({});
    });
  });
});
describe('src/redux/modules/entities/stores.js:selectors', () => {
  it('getAllBusinesses', () => {
    expect(getAllStores(mockState)).toEqual(mockState.entities.stores);
  });
  it('getStoreById', () => {
    expect(getStoreById(mockState, '123456')).toEqual({
      name: 'mockStore',
    });
  });
});
