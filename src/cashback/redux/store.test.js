import store from './store';

it('src/cashback/redux/store.js', () => {
  const state = store.getState();
  expect(state).toEqual({
    app: {
      business: null,
      coreBusiness: {
        enableCashback: true,
        loadCoreBusinessStatus: null,
      },
      error: null,
      messageInfo: {
        key: null,
        message: null,
        show: false,
      },
      onlineStoreInfo: {
        id: '',
        isFetching: false,
        loadOnlineStoreInfoStatus: null,
        logo: null,
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
        loadConsumerCustomerStatus: null,
        loginTngRequest: {
          error: null,
          status: null,
        },
        noWhatsAppAccount: true,
        otpRequest: {
          data: {
            type: 'otp',
          },
          error: null,
          status: null,
        },
        phone: null,
        prompt: null,
        profile: {
          id: '',
          phone: '',
          firstName: '',
          lastName: '',
          email: '',
          gender: '',
          birthday: '',
          birthdayModifiedTime: '',
          notificationSettings: '',
          birthdayChangeAllowed: false,
          status: null,
        },
        showLoginModal: false,
        storeCreditsBalance: 0,
        totalCredits: 0,
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
    storeRedemption: {
      requestId: null,
      sharedInfoData: {
        id: '',
        merchantName: '',
        expiredDate: '',
        scannedDate: '',
        source: '',
        consumerId: '',
        customerId: '',
        sharedInfoDate: '',
        isNewCustomer: false,
      },
      updateSharingConsumerInfo: {
        status: null,
      },
      confirmSharingConsumerInfo: {
        status: null,
      },
    },
  });
});
