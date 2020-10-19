import homeReducers, { initialState, getAllStores, getOneStoreInfo, getStoreHashCode, showStores, types } from './home';
import mockState from '../__fixture__/state.fixture';

describe('src/stores/redux/modules/homeReducers.js:reducers', () => {
  it('should return the initial state', () => {
    expect(homeReducers(undefined, {})).toEqual(initialState);
  });

  it('FETCH_STORE_HASHCODE_SUCCESS', () => {
    const action = {
      type: types.FETCH_STORE_HASHCODE_SUCCESS,
      response: {
        redirectTo: 'mockRedirectTo',
      },
    };
    expect(homeReducers(initialState, action)).toEqual({
      ...initialState,
      storeHashCode: 'mockRedirectTo',
    });
  });

  it('FETCH_CORESTORES_REQUEST', () => {
    const action = {
      type: types.FETCH_CORESTORES_REQUEST,
    };
    expect(homeReducers(initialState, action)).toEqual({
      ...initialState,
    });
  });

  it('FETCH_CORESTORES_SUCCESS', () => {
    const action = {
      type: types.FETCH_CORESTORES_SUCCESS,
      responseGql: {
        data: {
          business: {
            stores: [
              {
                id: '111',
                isOnline: true,
                isDeleted: false,
              },
              {
                id: '222',
                isOnline: false,
                isDeleted: false,
              },
            ],
            qrOrderingSettings: {
              enableDelivery: false,
            },
          },
        },
      },
    };
    expect(homeReducers(initialState, action)).toEqual({
      ...initialState,
      isFetching: false,
      storeIds: ['111'],
    });
  });
  it('FETCH_CORESTORES_FAILURE', () => {
    const action = {
      type: types.FETCH_CORESTORES_FAILURE,
    };
    expect(homeReducers(initialState, action)).toEqual({
      ...initialState,
      isFetching: false,
    });
  });
});

describe('src/stores/redux/modules/homeReducers.js:selectors', () => {
  it('getAllStores', () => {
    expect(getAllStores(mockState)).toEqual([
      {
        city: 'universe',
        id: '5de71ef1e872af6ab28a6c74',
        isDeleted: null,
        isOnline: true,
        name: 'coffee',
        state: 'normal',
        street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
        street2: '',
      },
      {
        city: 'my',
        id: '5de72d57e872af6ab28a7809',
        isDeleted: null,
        isOnline: true,
        name: 'Mercy',
        state: 'normal',
        street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
        street2: '',
      },
    ]);
  });

  it('getOneStoreInfo', () => {
    expect(getOneStoreInfo(mockState, '5de71ef1e872af6ab28a6c74')).toEqual({
      city: 'universe',
      id: '5de71ef1e872af6ab28a6c74',
      isDeleted: null,
      isOnline: true,
      name: 'coffee',
      state: 'normal',
      street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
      street2: '',
    });
  });

  it('getStoreHashCode', () => {
    expect(getStoreHashCode(mockState)).toEqual(null);
  });

  it('showStores', () => {
    expect(showStores(mockState)).toEqual(true);
  });
});
