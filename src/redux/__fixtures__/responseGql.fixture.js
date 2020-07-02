const mockResponseGql = {
  data: {
    onlineCategory: [
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
          },
        ],
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
          },
        ],
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
          },
        ],
      },
    ],
  },
  error: null,
};
export default mockResponseGql;
