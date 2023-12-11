import store from './store';

it('src/cashback/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      error: null,
      messageInfo: {
        key: null,
        message: null,
        show: false,
      },
      onlineStoreInfo: {
        id: '',
        isFetching: false,
      },
      requestInfo: {
        storeId: null,
        tableId: null,
      },
      user: {
        consumerId: null,
        country: 'US',
        customerId: '',
        isError: false,
        isExpired: false,
        isLogin: false,
        isWebview: false,
        noWhatsAppAccount: true,
        otpRequest: {
          data: {
            type: 'otp',
          },
          error: null,
          status: null,
        },
        phone: null,
        prompt: 'Do you have a Beep account? Login with your mobile phone number.',
        storeCreditsBalance: 0,
      },
    },
    claim: { cashbackInfo: null, receiptNumber: null },
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
    home: { fetchState: true, receiptList: [] },
  });
});
