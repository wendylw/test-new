import store from './store';

it('src/ordering/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageModal: { description: '', message: '', show: false },
      onlineStoreInfo: { id: '', isFetching: false },
      requestInfo: { storeId: null, tableId: null },
      user: {
        consumerId: null,
        customerId: '',
        hasOtp: false,
        isExpired: false,
        isLogin: false,
        isWebview: false,
        showLoginPage: false,
        storeCreditsBalance: 0,
      },
    },
    cart: { pendingTransactionsIds: [] },
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
    home: {
      currentProduct: { cartId: '', id: '', isFetching: false },
      domProperties: { verticalMenuBusinesses: [''] },
      onlineCategory: { categoryIds: [], isFetching: false },
      shoppingCart: { isFetching: false, itemIds: [], unavailableItemIds: [] },
    },
    payment: { bankingList: [], braintreeToken: '', currentPayment: 'CCPP', orderId: '', thankYouPageUrl: '' },
    thankYou: { cashbackInfo: null, orderId: null },
  });
});
