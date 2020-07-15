import store from './store';

it('src/stores/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageModal: { description: '', message: '', show: false },
      onlineStoreInfo: { id: '', isFetching: false },
      requestInfo: { storeId: null, tableId: null },
    },
    entities: {
      businesses: { businesses: {} },
      carts: { data: {}, summary: { count: 0, discount: 0, storeCreditsBalance: 0, subtotal: 0, tax: 0, total: 0 } },
      categories: {},
      loyaltyHistories: {},
      onlineStores: {},
      orders: {},
      products: {},
      stores: {},
    },
    home: { storeHashCode: null, storeIds: [] },
  });
});
