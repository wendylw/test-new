import store from './store';

it('src/cashback/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageInfo: { key: null, message: null, show: false },
      onlineStoreInfo: { id: '', isFetching: false },
      requestInfo: { storeId: null, tableId: null },
      user: {
        consumerId: null,
        customerId: '',
        hasOtp: false,
        isExpired: false,
        isLogin: false,
        isWebview: false,
        prompt: 'Do you have a Beep account? Login with your mobile phone number.',
        storeCreditsBalance: 0,
      },
    },
    claim: { cashbackInfo: null, receiptNumber: null },
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
    home: { cashbackHistorySummary: null, customerId: null, fetchState: true, receiptList: [] },
  });
});
