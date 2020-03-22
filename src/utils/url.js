const API_URLS = {
  GET_CART: {
    url: '/api/cart',
    method: 'get',
  },
  GET_CART_TYPE: isDeliveryType => {
    let CartObj = API_URLS.GET_CART;
    if (isDeliveryType) {
      CartObj.url = '/api/cart?shippingType=delivery';
    }
    return CartObj;
  },
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
    method: 'get',
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
    url: '/api/transactions',
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
  PHONE_NUMBER_LOGIN: {
    url: '/api/v2/login',
    method: 'post',
  },
  GET_TERMS_PRIVACY: {
    ur: '/api/privacy',
    method: 'get',
  },
  POST_OTP: url => ({
    url,
    method: 'post',
    mode: 'cors',
  }),
  GET_CUSTOMER_PROFILE: consumerId => ({
    url: `/api/consumers/${consumerId}/customer`,
    method: 'get',
  }),
  GET_PENDING_TRANSACTIONS: {
    url: '/api/transactions/status/pending',
    method: 'get',
  },
  PUT_TRANSACTIONS_STATUS: {
    url: '/api/transactions/status',
    method: 'put',
  },
  DELETE_CARTITEMS_BY_PRODUCTS: {
    url: '/api/cart/items',
    method: 'del',
  },
};

export default {
  apiGql: operationName => `/api/gql/${operationName}`,
  API_URLS,
};
