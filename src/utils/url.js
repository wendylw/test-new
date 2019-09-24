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
  GET_GET_CASHBACK_HASH_DATA: hash => ({
    url: `/api/cashback/hash/${hash}/decode`,
    method: 'get',
  }),
  GET_CASHBACK_BUSINESS: {
    url: '/api/cashback/business',
    method: 'get'
  },
  GET_CASHBACK_HISTORIES: {
    url: '/api/cashback/history',
    method: 'get',
  },
  GET_STORE_HASH_DATA: storeId => ({
    url: `/api/ordering/stores/${storeId}?a=redirectTo`,
    method: 'get',
  }),
  GET_RECEIPTS_LIST: {
    url: '/api/transaction',
    method: 'get',
  },
  GET_LOGIN_STATUS: {
    url: '/api/ping',
    method: 'get',
  },
  POST_LOGIN: {
    url: '/api/login',
    method: 'post',
  },
  POST_OTP: {
    url: '/api/authorize', //TODO: change to new url
    method: 'post',
  },
};

export default {
  apiGql: operationName => `/api/gql/${operationName}`,
  API_URLS,
};
