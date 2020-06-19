const mockState = {
  entities: {
    carts: {
      summary: {
        count: 0,
        discount: 0,
        subtotal: 0,
        total: 0,
        tax: 0,
        storeCreditsBalance: 0,
      },
      data: {},
    },
    categories: {},
    loyaltyHistories: {},
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
    orders: {},
    products: {},
    stores: {
      '5de71ef1e872af6ab28a6c74': {
        id: '5de71ef1e872af6ab28a6c74',
        name: 'coffee',
        isOnline: true,
        isDeleted: null,
        street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
        street2: '',
        city: 'universe',
        state: 'normal',
      },
      '5de72d57e872af6ab28a7809': {
        id: '5de72d57e872af6ab28a7809',
        name: 'Mercy',
        isOnline: true,
        isDeleted: null,
        street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
        street2: '',
        city: 'my',
        state: 'normal',
      },
    },
    businesses: {
      businesses: {},
      caipinfang: {
        name: 'caipinfang',
        stores: [
          {
            id: '5de71ef1e872af6ab28a6c74',
            name: 'coffee',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'universe',
            state: 'normal',
          },
          {
            id: '5de72d57e872af6ab28a7809',
            name: 'Mercy',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'my',
            state: 'normal',
          },
        ],
      },
    },
  },
  app: {
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
    storeHashCode: null,
    storeIds: ['5de71ef1e872af6ab28a6c74', '5de72d57e872af6ab28a7809'],
    isFetching: false,
  },
};
export default mockState;
