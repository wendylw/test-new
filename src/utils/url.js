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
  GET_CAHSBACK_BUSINESS: {
    url: '/api/cashback/business',
    method: 'get'
  },
  GET_CASHBACK_HISTORIES: {
    url: '/api/cashback/history',
    method: 'get',
  },
  GET_STORE_HASHDATA: storeId => ({
    url: `/api/ordering/stores/${storeId}?a=redirectTo`,
    method: 'get',
  }),
  GET_LOGIN_STATUS: {
    url: '/api/ping',
    method: 'get',
  },
  POST_LOGIN: {
    url: '/api/login',
    method: 'post',
  },
};

export default {
  apiGql: operationName => `/api/gql/${operationName}`,
  API_URLS,
};
