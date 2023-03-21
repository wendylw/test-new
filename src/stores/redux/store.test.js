import store from './store';

it('src/stores/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageModal: { description: '', message: '', show: false },
      onlineStoreInfo: { id: '', isFetching: false },
      removePickUpMerchantList: [''],
      requestInfo: { storeId: null, tableId: null },
    },
    entities: {
      businesses: {},
      categories: {},
      error: {},
      loyaltyHistories: {},
      onlineStores: {},
      orders: {},
      products: {},
      stores: {},
    },
    home: {
      storeHashCode: null,
      storeIds: [],
      currentOrderMethod: '',
      currentStoreId: null,
      deliveryRadius: 0,
      enableDelivery: false,
    },
    tables: {
      currentTableId: '',
      storeHashCode: '',
      tables: [],
    },
    address: {
      addressInfo: {
        data: null,
        error: null,
        status: null,
      },
    },
  });
});
