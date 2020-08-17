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
      carts: {
        data: {},
        promotion: null,
        summary: { count: 0, discount: 0, storeCreditsBalance: 0, subtotal: 0, tax: 0, total: 0 },
      },
      categories: {},
      error: {},
      loyaltyHistories: {},
      onlineStores: {},
      orders: {},
      paymentOptions: {
        data: {
          Line: {
            key: 'Line',
            label: 'Line',
            logo: 'paymentLineImage',
          },
          TNG: {
            key: 'TNG',
            label: 'TouchNGo',
            logo: 'paymentTNGImage',
          },
          boost: {
            key: 'boost',
            label: 'Boost',
            logo: 'paymentBoostImage',
          },
          creditCard: {
            key: 'creditCard',
            label: 'CreditCard',
            logo: 'paymentCreditImage',
            pathname: '/payment/creditcard',
          },
          gcash: {
            key: 'gcash',
            label: 'GCash',
            logo: 'paymentGcashImage',
          },
          grabPay: {
            key: 'grabPay',
            label: 'GrabPay',
            logo: 'paymentGrabImage',
          },
          onlineBanking: {
            key: 'onlineBanking',
            label: 'OnlineBanking',
            logo: 'paymentBankingImage',
            pathname: '/payment/online-banking',
          },
          stripe: {
            key: 'stripe',
            label: 'CreditCard',
            logo: 'paymentCreditImage',
            pathname: '/payment/stripe',
          },
        },
      },
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
  });
});
