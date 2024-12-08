const fetchShoppingCartData = {
  total: 15.64,
  subtotal: 14.75,
  count: 5,
  discount: 0,
  tax: 0.89,
  serviceCharge: 0,
  serviceChargeTax: 0,
  loyaltyDiscounts: null,
  items: [
    {
      id: 'd79db2cd92d785e5d4c07e046052bb34',
      productId: '5de4dc12f90ac02b38b93f28',
      parentProductId: null,
      title: 'RM 1 product',
      variationTexts: [],
      variations: [],
      markedSoldOut: false,
      displayPrice: 0.94,
      quantity: 3,
      image: '',
    },
    {
      id: '41f0bafe441a059d8f76f2c966732b85',
      productId: '5de4cab68f1b5f2526c878e6',
      parentProductId: '5cf9e124a868056e6ddf7dd3',
      title: 'testing online product(2)',
      variationTexts: ['2'],
      variations: [
        { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87867', markedSoldOut: false },
      ],
      markedSoldOut: false,
      displayPrice: 10.8,
      quantity: 1,
      image:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/product/5cf9e124a868056e6ddf7dd3/a556990a-ae0a-40e0-87e5-e0ee9a67395d',
    },
    {
      id: '3c81558b01e1c770b6442b9fd0f6d763',
      productId: '5de4cab68f1b5f2526c878e2',
      parentProductId: '5cf9e124a868056e6ddf7dd3',
      title: 'testing online product(1)',
      variationTexts: ['1'],
      variations: [
        { variationId: '5de4ca9a8f1b5f2526c87866', optionId: '5de4ca9a8f1b5f2526c87868', markedSoldOut: false },
      ],
      markedSoldOut: false,
      displayPrice: 1.12,
      quantity: 1,
      image:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/product/5cf9e124a868056e6ddf7dd3/a556990a-ae0a-40e0-87e5-e0ee9a67395d',
    },
  ],
  unavailableItems: [],
};

const fetchOnlineCategoryData = {
  data: {
    onlineCategory: [
      {
        id: '5da845cf2d7b4244276bddb2',
        name: 'Must Try!',
        isEnabled: true,
        products: [],
      },
      {
        id: '5cdce13be5fea1125c716dd5',
        name: 'Drinks',
        isEnabled: true,
        products: [],
      },
      {
        id: '5cd159c1fb012d7c4b1c9f9d',
        name: 'Desserts',
        isEnabled: true,
        products: [
          {
            id: '5de0e8f48f1b5f2526c871c9',
            title: 'test- minimum spend-2',
            displayPrice: 11,
            trackInventory: true,
            images: [],
            markedSoldOut: false,
            variations: [
              {
                id: '5de0e9618f1b5f2526c8722c',
                name: 'add',
                variationType: 'MultipleChoice',
                optionValues: [
                  {
                    markedSoldOut: false,
                    id: '5de0e9618f1b5f2526c8722e',
                    value: '+1',
                  },
                  {
                    markedSoldOut: false,
                    id: '5de0e9618f1b5f2526c8722d',
                    value: '+0.3',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

const RemoveShoppingCartItemData = {
  data: {
    removeShoppingCartItem: {
      productId: '5de4cab68f1b5f2526c878e2',
    },
  },
};
const AddOrUpdateShoppingCartItemData = {
  data: {
    addOrUpdateShoppingCartItem: {
      shoppingCartItem: { id: '41f0bafe441a059d8f76f2c966732b85', business: 'ectest', quantity: 2 },
    },
  },
};

const fetchProductDetailData = {
  data: {
    product: {
      id: '5dbfcc7f637055227dd94e58',
      title: 'Latte (sample)',
      displayPrice: 15.84,
      unitPrice: 12,
      onlineUnitPrice: null,
      inventoryType: '',
      images: [
        'https://d16kpilgrxu9w6.cloudfront.net/wenjingzhang/product/5dbfcc7f637055227dd94e58/778ff0bb-79c9-476b-8503-da05908b7978',
      ],
      description:
        '<span style="font-weight: 700;">中国风一中国风二中国风三中国风四中国风五中国风六中国风七中国风八中国风九中国风十中国风一中国风二中国风三中国风四中国风五中国风六中国风七中国风八中国风九中国风十</span>',
      variations: [
        {
          id: '5dbfcc7f637055227dd94e6c',
          name: 'Temperature',
          variationType: 'SingleChoice',
          optionValues: [
            {
              id: '5dbfcc7f637055227dd94e6e',
              value: 'Hot',
              priceDiff: 0,
              markedSoldOut: false,
            },
            {
              id: '5dbfcc7f637055227dd94e6d',
              value: 'Cold',
              priceDiff: 0,
              markedSoldOut: false,
            },
          ],
        },
        {
          id: '5dbfcc7f637055227dd94e68',
          name: 'Size',
          variationType: 'SingleChoice',
          optionValues: [
            {
              id: '5dbfcc7f637055227dd94e6b',
              value: 'S',
              priceDiff: 0,
              markedSoldOut: false,
            },
            {
              id: '5dbfcc7f637055227dd94e6a',
              value: 'M',
              priceDiff: 0,
              markedSoldOut: false,
            },
            {
              id: '5dbfcc7f637055227dd94e69',
              value: 'L',
              priceDiff: 0,
              markedSoldOut: false,
            },
          ],
        },
        {
          id: '5dbfcc7f637055227dd94e64',
          name: 'Add-ons',
          variationType: 'MultipleChoice',
          optionValues: [
            {
              id: '5dbfcc7f637055227dd94e67',
              value: 'Extra espresso shot',
              priceDiff: 0.99,
              markedSoldOut: false,
            },
            {
              id: '5dbfcc7f637055227dd94e66',
              value: 'Flavor shot',
              priceDiff: 0.66,
              markedSoldOut: false,
            },
            {
              id: '5dbfcc7f637055227dd94e65',
              value: 'Whipped cream topping',
              priceDiff: 1.32,
              markedSoldOut: false,
            },
          ],
        },
      ],
      trackInventory: false,
      childrenMap: [],
    },
  },
};
const productParams = {
  id: '5dbfcc7f637055227dd94e58',
  title: 'Latte (sample)',
  displayPrice: 15.84,
  trackInventory: false,
  images: [
    'https://d16kpilgrxu9w6.cloudfront.net/wenjingzhang/product/5dbfcc7f637055227dd94e58/778ff0bb-79c9-476b-8503-da05908b7978',
  ],
  markedSoldOut: false,
  variations: [
    {
      id: '5dbfcc7f637055227dd94e6c',
      name: 'Temperature',
      variationType: 'SingleChoice',
      optionValues: [
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e6e', value: 'Hot' },
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e6d', value: 'Cold' },
      ],
    },
    {
      id: '5dbfcc7f637055227dd94e68',
      name: 'Size',
      variationType: 'SingleChoice',
      optionValues: [
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e6b', value: 'S' },
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e6a', value: 'M' },
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e69', value: 'L' },
      ],
    },
    {
      id: '5dbfcc7f637055227dd94e64',
      name: 'Add-ons',
      variationType: 'MultipleChoice',
      optionValues: [
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e67', value: 'Extra espresso shot' },
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e66', value: 'Flavor shot' },
        { markedSoldOut: false, id: '5dbfcc7f637055227dd94e65', value: 'Whipped cream topping' },
      ],
    },
  ],
  isFeaturedProduct: false,
  _needMore: 3,
  soldOut: false,
  hasSingleChoice: true,
  cartQuantity: 1,
  cartItemIds: ['0b16e6886f54eae31d906badc87172e4'],
  cartItems: [
    {
      id: '0b16e6886f54eae31d906badc87172e4',
      productId: '5dbfcc7f637055227dd94e58',
      parentProductId: null,
      title: 'Latte (sample)',
      variationTexts: ['Hot', 'S'],
      variations: [
        { variationId: '5dbfcc7f637055227dd94e6c', optionId: '5dbfcc7f637055227dd94e6e', markedSoldOut: false },
        { variationId: '5dbfcc7f637055227dd94e68', optionId: '5dbfcc7f637055227dd94e6b', markedSoldOut: false },
      ],
      markedSoldOut: false,
      displayPrice: 15.84,
      quantity: 1,
      image:
        'https://d16kpilgrxu9w6.cloudfront.net/wenjingzhang/product/5dbfcc7f637055227dd94e58/778ff0bb-79c9-476b-8503-da05908b7978',
      _available: true,
    },
  ],
  canDecreaseQuantity: true,
};

const getAllProductsParams = {
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
          { markedSoldOut: false, id: '5e12b6caed43e34e3787463e', value: '11' },
          { markedSoldOut: false, id: '5e12b6caed43e34e3787463d', value: '22' },
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
          { markedSoldOut: false, id: '5de720aee872af6ab28a6ca6', value: 'cold' },
          { markedSoldOut: false, id: '5de720aee872af6ab28a6ca5', value: 'hot' },
        ],
      },
      {
        id: '5e12b3e2ed43e34e37874632',
        name: 'multiple tesrt',
        variationType: 'MultipleChoice',
        optionValues: [
          { markedSoldOut: false, id: '5e12b3e2ed43e34e37874634', value: '1' },
          { markedSoldOut: false, id: '5e12b3e2ed43e34e37874633', value: '2' },
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
          { markedSoldOut: false, id: '5de72ec75234055a77249c1c', value: 'cold' },
          { markedSoldOut: false, id: '5de72ec75234055a77249c1b', value: 'hot' },
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
          { markedSoldOut: false, id: '5e12bd73ed43e34e37874643', value: 't1' },
          { markedSoldOut: false, id: '5e12bd73ed43e34e37874642', value: 't2' },
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
};

const getAllCategoriesParams = {
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
};

const getCartItemListParams = [
  {
    id: '366d5ee63410fb91a0e5c54febca984a',
    productId: '5e12b3f2ed43e34e37874636',
    parentProductId: null,
    title: 'test',
    variationTexts: [],
    variations: [],
    markedSoldOut: false,
    displayPrice: 40,
    quantity: 1,
    image: '',
    _available: true,
  },
];

const getCategoryProductListResult = [
  {
    id: '5de72606e8fb5d6ac10fe39c',
    name: 'All',
    isEnabled: true,
    products: [
      {
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
              { markedSoldOut: false, id: '5e12b6caed43e34e3787463e', value: '11' },
              { markedSoldOut: false, id: '5e12b6caed43e34e3787463d', value: '22' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
        soldOut: false,
        hasSingleChoice: false,
        cartQuantity: 1,
        cartItemIds: ['366d5ee63410fb91a0e5c54febca984a'],
        cartItems: [
          {
            id: '366d5ee63410fb91a0e5c54febca984a',
            productId: '5e12b3f2ed43e34e37874636',
            parentProductId: null,
            title: 'test',
            variationTexts: [],
            variations: [],
            markedSoldOut: false,
            displayPrice: 40,
            quantity: 1,
            image: '',
            _available: true,
          },
        ],
        canDecreaseQuantity: true,
      },
      {
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
              { markedSoldOut: false, id: '5de720aee872af6ab28a6ca6', value: 'cold' },
              { markedSoldOut: false, id: '5de720aee872af6ab28a6ca5', value: 'hot' },
            ],
          },
          {
            id: '5e12b3e2ed43e34e37874632',
            name: 'multiple tesrt',
            variationType: 'MultipleChoice',
            optionValues: [
              { markedSoldOut: false, id: '5e12b3e2ed43e34e37874634', value: '1' },
              { markedSoldOut: false, id: '5e12b3e2ed43e34e37874633', value: '2' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 2,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
      {
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
              { markedSoldOut: false, id: '5de72ec75234055a77249c1c', value: 'cold' },
              { markedSoldOut: false, id: '5de72ec75234055a77249c1b', value: 'hot' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
      {
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
              { markedSoldOut: false, id: '5e12bd73ed43e34e37874643', value: 't1' },
              { markedSoldOut: false, id: '5e12bd73ed43e34e37874642', value: 't2' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
      {
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
        soldOut: false,
        hasSingleChoice: false,
        cartQuantity: 0,
      },
    ],
    cartQuantity: 1,
  },
  {
    id: '5de732c45234055a7724a9d9',
    name: 'coffee',
    isEnabled: true,
    products: [
      {
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
              { markedSoldOut: false, id: '5de720aee872af6ab28a6ca6', value: 'cold' },
              { markedSoldOut: false, id: '5de720aee872af6ab28a6ca5', value: 'hot' },
            ],
          },
          {
            id: '5e12b3e2ed43e34e37874632',
            name: 'multiple tesrt',
            variationType: 'MultipleChoice',
            optionValues: [
              { markedSoldOut: false, id: '5e12b3e2ed43e34e37874634', value: '1' },
              { markedSoldOut: false, id: '5e12b3e2ed43e34e37874633', value: '2' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 2,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
      {
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
              { markedSoldOut: false, id: '5de72ec75234055a77249c1c', value: 'cold' },
              { markedSoldOut: false, id: '5de72ec75234055a77249c1b', value: 'hot' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
      {
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
              { markedSoldOut: false, id: '5e12bd73ed43e34e37874643', value: 't1' },
              { markedSoldOut: false, id: '5e12bd73ed43e34e37874642', value: 't2' },
            ],
          },
        ],
        isFeaturedProduct: true,
        _needMore: 1,
        soldOut: false,
        hasSingleChoice: true,
        cartQuantity: 0,
      },
    ],
    cartQuantity: 0,
  },
  {
    id: '5de733315234055a7724a9e1',
    name: 'tea',
    isEnabled: true,
    products: [
      {
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
        soldOut: false,
        hasSingleChoice: false,
        cartQuantity: 0,
      },
    ],
    cartQuantity: 0,
  },
];
export {
  fetchShoppingCartData,
  fetchOnlineCategoryData,
  RemoveShoppingCartItemData,
  AddOrUpdateShoppingCartItemData,
  fetchProductDetailData,
  productParams,
  getAllProductsParams,
  getAllCategoriesParams,
  getCartItemListParams,
  getCategoryProductListResult,
};
