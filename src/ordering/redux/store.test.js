import store from './store';

it('src/ordering/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageModal: { buttonText: '', description: '', message: '', show: false },
      onlineStoreInfo: { id: '', isFetching: false },
      requestInfo: { storeId: null, tableId: null },
      user: {
        consumerId: null,
        customerId: '',
        hasOtp: false,
        isExpired: false,
        isLogin: false,
        showLoginPage: false,
        storeCreditsBalance: 0,
      },
    },
    cart: { pendingTransactionsIds: [] },
    customer: {
      deliveryDetails: {
        addressDetails: '',
        deliveryComments: '',
        deliveryToAddress: '',
        deliveryToLocation: {
          latitude: 0,
          longitude: 0,
        },
        phone: '',
        username: '',
      },
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
      coreStore: { isFetching: false, storeList: [], storeHashCode: '' },
      currentProduct: { cartId: '', id: '', isFetching: false },
      domProperties: { verticalMenuBusinesses: [''], productItemMinHeight: 107.64 },
      onlineCategory: { categoryIds: [], isFetching: false },
      popUpModal: {
        userConfirmed: false,
      },
      shoppingCart: { isFetching: false, itemIds: [], unavailableItemIds: [] },
    },
    payment: { bankingList: [], braintreeToken: '', currentPayment: '', orderId: '', thankYouPageUrl: '' },
    promotion: {
      inProcess: false,
      promoCode: '',
      promoType: '',
      status: '',
      validFrom: '',
    },
    reportDriver: {
      inputNotes: '',
      selectedReasonCode: null,
      showPageLoader: true,
      submitStatus: 'NOT_SUBMIT',
      uploadPhoto: {
        file: null,
        location: '',
        url: '',
      },
    },
    thankYou: { cashbackInfo: null, orderId: null, storeHashCode: null },
  });
});
