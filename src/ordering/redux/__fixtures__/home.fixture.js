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

const getShoppingCartSelectorResult = {
  items: [
    {
      _available: true,
      displayPrice: 0.94,
      id: 'd79db2cd92d785e5d4c07e046052bb34',
      image: '',
      markedSoldOut: false,
      parentProductId: null,
      productId: '5de4dc12f90ac02b38b93f28',
      quantity: 3,
      title: 'RM 1 product',
      variationTexts: [],
      variations: [],
    },
    {
      _available: true,
      displayPrice: 10.8,
      id: '41f0bafe441a059d8f76f2c966732b85',
      image:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/product/5cf9e124a868056e6ddf7dd3/a556990a-ae0a-40e0-87e5-e0ee9a67395d',
      markedSoldOut: false,
      parentProductId: '5cf9e124a868056e6ddf7dd3',
      productId: '5de4cab68f1b5f2526c878e6',
      quantity: 1,
      title: 'testing online product(2)',
      variationTexts: ['2'],
      variations: [
        {
          markedSoldOut: false,
          optionId: '5de4ca9a8f1b5f2526c87867',
          variationId: '5de4ca9a8f1b5f2526c87866',
        },
      ],
    },
    {
      _available: true,
      displayPrice: 1.12,
      id: '3c81558b01e1c770b6442b9fd0f6d763',
      image:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/product/5cf9e124a868056e6ddf7dd3/a556990a-ae0a-40e0-87e5-e0ee9a67395d',
      markedSoldOut: false,
      parentProductId: '5cf9e124a868056e6ddf7dd3',
      productId: '5de4cab68f1b5f2526c878e2',
      quantity: 1,
      title: 'testing online product(1)',
      variationTexts: ['1'],
      variations: [
        {
          markedSoldOut: false,
          optionId: '5de4ca9a8f1b5f2526c87868',
          variationId: '5de4ca9a8f1b5f2526c87866',
        },
      ],
    },
  ],
  summary: {
    count: 5,
    discount: 0,
    loyaltyDiscounts: null,
    serviceCharge: 0,
    serviceChargeTax: 0,
    subtotal: 14.75,
    tax: 0.89,
    total: 15.64,
  },
  unavailableItems: [],
};

const getCategoryProductListSelectorResult = [
  {
    cartQuantity: 0,
    id: '5cd159c1fb012d7c4b1c9f9d',
    isEnabled: true,
    name: 'Desserts',
    products: [
      {
        _needMore: 1,
        cartQuantity: 0,
        displayPrice: 11,
        hasSingleChoice: false,
        id: '5de0e8f48f1b5f2526c871c9',
        images: [],
        markedSoldOut: false,
        soldOut: false,
        title: 'test- minimum spend-2',
        trackInventory: true,
        variations: [
          {
            id: '5de0e9618f1b5f2526c8722c',
            name: 'add',
            optionValues: [
              {
                id: '5de0e9618f1b5f2526c8722e',
                markedSoldOut: false,
                value: '+1',
              },
              {
                id: '5de0e9618f1b5f2526c8722d',
                markedSoldOut: false,
                value: '+0.3',
              },
            ],
            variationType: 'MultipleChoice',
          },
        ],
      },
    ],
  },
];

export {
  fetchShoppingCartData,
  fetchOnlineCategoryData,
  RemoveShoppingCartItemData,
  AddOrUpdateShoppingCartItemData,
  fetchProductDetailData,
  productParams,
  getShoppingCartSelectorResult,
  getCategoryProductListSelectorResult,
};
