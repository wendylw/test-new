const API_URLS = {
  GET_BRAINTREE_TOKEN: {
    url: '/payment/initToken',
    method: 'get',
  },
  GET_BANKING_LIST: {
    url: '/payment/onlineBanking',
    method: 'get',
  },
  GET_CASHBACK: {
    url: '/api/cashback',
    method: 'get',
  },
  POST_CASHBACK: {
    url: '/api/cashback',
    method: 'post',
  },
  GET_CASHBACK_HASDATA: hash => ({
    url: `/api/cashback/hash/${hash}/decode`,
    method: 'get',
  }),
};

export default {
  apiGql: operationName => `/api/gql/${operationName}`,
  API_URLS,
};
