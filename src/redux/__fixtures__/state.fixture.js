const mockState = {
  entities: {
    carts: {
      summary: {
        total: 50,
        subtotal: 50,
        count: 2,
        discount: 0,
        tax: 0,
        serviceCharge: 0,
        serviceChargeTax: 0,
        loyaltyDiscounts: null,
      },
      data: {
        '1a5fb008266358952206ca9fa8927f95': {
          id: '1a5fb008266358952206ca9fa8927f95',
          productId: '5de720aee872af6ab28a6ca3',
          parentProductId: null,
          title: 'Latte',
          variationTexts: ['cold'],
          variations: [
            {
              variationId: '5de720aee872af6ab28a6ca4',
              optionId: '5de720aee872af6ab28a6ca6',
              markedSoldOut: false,
            },
          ],
          markedSoldOut: false,
          displayPrice: 25,
          quantity: 2,
          image:
            'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
          _available: true,
        },
      },
    },
    categories: {
      '5de72606e8fb5d6ac10fe39c': {
        id: '5de72606e8fb5d6ac10fe39c',
        name: 'All',
        isEnabled: true,
        products: [
          '5e12b3f2ed43e34e37874636',
          '5de720aee872af6ab28a6ca3',
          '5de72ec75234055a77249c19',
          '5e12bd73ed43e34e37874640',
          '5de7304b5234055a7724a4e1',
        ],
      },
      '5de732c45234055a7724a9d9': {
        id: '5de732c45234055a7724a9d9',
        name: 'coffee',
        isEnabled: true,
        products: ['5de720aee872af6ab28a6ca3', '5de72ec75234055a77249c19', '5e12bd73ed43e34e37874640'],
      },
      '5de733315234055a7724a9e1': {
        id: '5de733315234055a7724a9e1',
        name: 'tea',
        isEnabled: true,
        products: ['5de7304b5234055a7724a4e1'],
      },
    },
    loyaltyHistories: {
      '123': {
        test: 'hello',
      },
    },
    onlineStores: {
      '5de726067ed3949af8fdd117': {
        id: '5de726067ed3949af8fdd117',
        storeName: null,
        logo: null,
        favicon: null,
        locale: 'MS-MY',
        currency: 'MYR',
        currencySymbol: 'RM',
        country: 'MY',
        state: null,
        street: null,
      },
    },
    orders: {
      '815520056159098': {
        id: '105e09a7-6c04-4886-9000-e2fa2373b8e5',
        orderId: '815520056159098',
        status: 'pendingPayment',
        storeId: '5bb7127e92efcf71784c1727',
        tableId: null,
        total: 1,
      },
    },
    products: {
      '5e12b3f2ed43e34e37874636': {
        id: '5e12b3f2ed43e34e37874636',
        title: 'test',
        displayPrice: 40,
        trackInventory: false,
        images: [],
        markedSoldOut: false,
        variations: [
          {
            id: '5e12b6caed43e34e3787463c',
            name: 'multipletest',
            variationType: 'MultipleChoice',
            optionValues: [
              {
                markedSoldOut: false,
                id: '5e12b6caed43e34e3787463e',
                value: '11',
              },
              {
                markedSoldOut: false,
                id: '5e12b6caed43e34e3787463d',
                value: '22',
              },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
      },
      '5de720aee872af6ab28a6ca3': {
        id: '5de720aee872af6ab28a6ca3',
        title: 'Latte',
        displayPrice: 25,
        trackInventory: false,
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de720aee872af6ab28a6ca3/eec6ee3e-35db-40f8-9d09-305d05c547fc',
        ],
        markedSoldOut: false,
        variations: [
          {
            id: '5de720aee872af6ab28a6ca4',
            name: 'temperature',
            variationType: 'SingleChoice',
            optionValues: [
              {
                markedSoldOut: false,
                id: '5de720aee872af6ab28a6ca6',
                value: 'cold',
              },
              {
                markedSoldOut: false,
                id: '5de720aee872af6ab28a6ca5',
                value: 'hot',
              },
            ],
          },
          {
            id: '5e12b3e2ed43e34e37874632',
            name: 'multiple tesrt',
            variationType: 'MultipleChoice',
            optionValues: [
              {
                markedSoldOut: false,
                id: '5e12b3e2ed43e34e37874634',
                value: '1',
              },
              {
                markedSoldOut: false,
                id: '5e12b3e2ed43e34e37874633',
                value: '2',
              },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 2,
      },
      '5de72ec75234055a77249c19': {
        id: '5de72ec75234055a77249c19',
        title: 'cappuccino',
        displayPrice: 22,
        trackInventory: false,
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de72ec75234055a77249c19/4e731a07-a81f-4507-ae4c-b293bca3fc52',
        ],
        markedSoldOut: false,
        variations: [
          {
            id: '5de72ec75234055a77249c1a',
            name: 'Temperature',
            variationType: 'SingleChoice',
            optionValues: [
              {
                markedSoldOut: false,
                id: '5de72ec75234055a77249c1c',
                value: 'cold',
              },
              {
                markedSoldOut: false,
                id: '5de72ec75234055a77249c1b',
                value: 'hot',
              },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
      },
      '5e12bd73ed43e34e37874640': {
        id: '5e12bd73ed43e34e37874640',
        title: 'newCoffee',
        displayPrice: 20,
        trackInventory: false,
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5e12bd73ed43e34e37874640/21c3fd76-9f9c-4ce8-b558-9943ce239a94',
        ],
        markedSoldOut: false,
        variations: [
          {
            id: '5e12bd73ed43e34e37874641',
            name: 'test1',
            variationType: 'SingleChoice',
            optionValues: [
              {
                markedSoldOut: false,
                id: '5e12bd73ed43e34e37874643',
                value: 't1',
              },
              {
                markedSoldOut: false,
                id: '5e12bd73ed43e34e37874642',
                value: 't2',
              },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
      },
      '5de7304b5234055a7724a4e1': {
        id: '5de7304b5234055a7724a4e1',
        title: 'red tea',
        displayPrice: 15,
        trackInventory: false,
        images: [
          'https://d16kpilgrxu9w6.cloudfront.net/caipinfang/product/5de7304b5234055a7724a4e1/251a3219-b3af-461f-ba28-4db4a55b6316',
        ],
        markedSoldOut: false,
        variations: [],
        isFeaturedProduct: true,
        _needMore: 0,
      },
    },
    stores: {},
    businesses: {
      businesses: {},
      caipinfang: {
        name: 'caipinfang',
        enablePax: false,
        enableServiceCharge: false,
        enableCashback: true,
        serviceChargeRate: null,
        serviceChargeTax: null,
        subscriptionStatus: 'Active',
        qrOrderingSettings: null,
        stores: [],
      },
    },
  },
  app: {
    user: {
      showLoginPage: false,
      isWebview: false,
      isLogin: false,
      isExpired: false,
      hasOtp: false,
      customerId: '',
      storeCreditsBalance: 0,
      isFetching: false,
    },
    error: null,
    messageModal: {
      show: false,
      message: '',
      description: '',
    },
    business: 'nike',
    onlineStoreInfo: {
      id: '5de726067ed3949af8fdd117',
      isFetching: false,
    },
    requestInfo: {
      tableId: '10',
      storeId: '5b432464eccd4c7eb52018c6',
    },
  },
  home: {
    domProperties: {
      verticalMenuBusinesses: [''],
    },
    currentProduct: {
      id: '',
      cartId: '',
      isFetching: false,
    },
    shoppingCart: {
      isFetching: false,
      itemIds: ['1a5fb008266358952206ca9fa8927f95'],
      unavailableItemIds: [],
    },
    onlineCategory: {
      isFetching: false,
      categoryIds: ['5de72606e8fb5d6ac10fe39c', '5de732c45234055a7724a9d9', '5de733315234055a7724a9e1'],
    },
  },
  cart: {
    pendingTransactionsIds: [],
  },
  payment: {
    currentPayment: 'CCPP',
    orderId: '',
    thankYouPageUrl: '',
    braintreeToken: '',
    bankingList: [],
  },
  thankYou: {
    orderId: null,
    cashbackInfo: null,
  },
};
export default mockState;
