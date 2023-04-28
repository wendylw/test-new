import storeReducers, { getAllStores, getStoreById, getCoreStoreList } from './stores';
import mockState from '../../__fixtures__/state.fixture';

describe('src/redux/modules/entities/stores.js:reducers', () => {
  it('should return the initial state', () => {
    expect(storeReducers(undefined, {})).toEqual({});
  });

  describe('action with responseGql', () => {
    it('valid business and stores', () => {
      const action = {
        type: 'whatever',
        responseGql: {
          data: {
            business: {
              name: 'mockName',
              qrOrderingSettings: {
                deliveryRadius: 0,
                disableTodayPreOrder: null,
                enableDelivery: true,
                enableLiveOnline: true,
                enablePreOrder: null,
                minimumConsumption: 0,
                useStorehubLogistics: true,
                validDays: [1, 2, 3, 4, 5, 6, 7],
                validTimeFrom: '00:00',
                validTimeTo: '23:59',
              },
              stores: [
                {
                  id: '123456',
                  name: 'mockStore',
                  qrOrderingSettings: {
                    useStorehubLogistics: true,
                  },
                },
                {
                  id: '5de71ef1e872af6ab28a6c74',
                  name: 'coffee',
                  isOnline: true,
                  isDeleted: null,
                  street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
                  street2: '',
                  city: 'universe',
                  state: 'normal',
                  qrOrderingSettings: {
                    useStorehubLogistics: true,
                  },
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
                  qrOrderingSettings: {
                    useStorehubLogistics: true,
                  },
                },
              ],
            },
          },
        },
      };
      const expectedState = {
        '123456': {
          id: '123456',
          name: 'mockStore',
          qrOrderingSettings: {
            useStorehubLogistics: true,
          },
        },
        '5de71ef1e872af6ab28a6c74': {
          id: '5de71ef1e872af6ab28a6c74',
          name: 'coffee',
          isOnline: true,
          isDeleted: null,
          street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
          street2: '',
          city: 'universe',
          state: 'normal',
          qrOrderingSettings: {
            useStorehubLogistics: true,
          },
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
          qrOrderingSettings: {
            useStorehubLogistics: true,
          },
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
      id: '123456',
      name: 'mockStore',
      qrOrderingSettings: {
        useStorehubLogistics: true,
      },
    });
  });
  it('getCoreStoreList', () => {
    expect(getCoreStoreList(mockState)).toEqual([
      {
        id: '123456',
        name: 'mockStore',
        qrOrderingSettings: {
          useStorehubLogistics: true,
        },
      },
      {
        id: '5de71ef1e872af6ab28a6c74',
        name: 'coffee',
        isOnline: true,
        isDeleted: null,
        street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
        street2: '',
        city: 'universe',
        state: 'normal',
        qrOrderingSettings: {
          useStorehubLogistics: true,
        },
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
        qrOrderingSettings: {
          useStorehubLogistics: true,
        },
      },
    ]);
  });
});
