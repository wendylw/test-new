import Utils from './utils';

const API_URLS = {
  GET_CART_TYPE: (isDeliveryType, deliveryCoords, fulfillDate) => {
    const CartObj = {
      url: '/api/cart',
      method: 'get',
    };
    const params = {
      shippingType: Utils.getApiRequestShippingType(),
    };

    if (isDeliveryType && deliveryCoords) {
      params.deliveryCoords = `${deliveryCoords.lat},${deliveryCoords.lng}`;
    }

    if (fulfillDate) {
      params.fulfillDate = fulfillDate;
    }
    CartObj.params = params;
    return CartObj;
  },
  GET_SAVED_CARD: id => ({
    url: `/api/consumers/${id}/paymentMethods`,
    method: 'get',
  }),
  GET_CASHBACK: {
    url: '/api/cashback',
    method: 'get',
  },
  POST_CASHBACK: {
    url: '/api/cashback',
    method: 'post',
  },
  GET_CASHBACK_HASH_DATA: hash => ({
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
  POST_STORE_HASH_DATA: storeId => ({
    url: `/api/ordering/stores/${storeId}`,
    method: 'post',
  }),
  GET_S3_POST_POLICY: action => ({
    url: `/api/s3-post-policy/${action}`,
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
  POST_OTP: url => ({
    url,
    method: 'post',
    mode: 'cors',
  }),
  GET_OTP: {
    url: '/api/v3/otp',
    method: 'post',
  },
  GET_WHATSAPP_SUPPORT: {
    url: '/api/v3/otp/check-phone',
    method: 'post',
  },
  GET_SEARCHING_STORE_LIST: {
    url: '/api/stores/search',
    method: 'get',
  },
  APPLY_VOUCHER_CODE: {
    url: '/api/cart/applyVoucher',
    method: 'post',
  },
  APPLY_PROMOTION_CODE: {
    url: '/api/cart/applyPromoCode',
    method: 'post',
  },
  DISMISS_PROMOTION_CODE: {
    url: '/api/cart/removePromoCode',
    method: 'post',
  },
  DISMISS_VOUCHER_CODE: {
    url: '/api/cart/unApplyVoucher',
    method: 'post',
  },
  CREATE_VOUCHER_ORDER: {
    url: '/api/transactions',
    method: 'post',
  },
  GET_COLLECTIONS: {
    url: '/api/stores/collections',
    method: 'get',
  },
  QUERY_FEED_BACK: {
    url: `/api/feedback`,
    method: 'get',
  },
  CREATE_FEED_BACK: {
    url: '/api/feedback',
    method: 'post',
  },
  GET_VOUCHER_LIST: {
    url: '/api/products/vouchers',
    method: 'get',
  },
  GET_TIME_SLOT: (shippingType, fulfillDate, storeid) => ({
    url: `/api/transactions/timeslots?shippingType=${shippingType}&fulfillDate=${fulfillDate}&storeId=${storeid}`,
    method: 'get',
  }),
  GET_COLLECTION: {
    url: '/api/stores/collection',
    method: 'get',
  },
  CREATE_ADDRESS: consumerId => ({
    url: `/api/consumers/${consumerId}/address`,
    method: 'post',
  }),
  UPDATE_ADDRESS: (consumerId, addressId) => ({
    url: `/api/consumers/${consumerId}/address/${addressId}`,
    method: 'put',
  }),
  PAYMENT_RISK: () => ({
    url: '/payment/risk',
    method: 'get',
  }),
  GET_DELIVERY_ADDRESS_DETAILS: (consumerId, storeId, savedAddressId) => ({
    url: `/api/consumers/${consumerId}/store/${storeId}/address/${savedAddressId}`,
    method: 'get',
  }),
};

export default {
  apiGql: operationName => `/api/gql/${operationName}`,
  API_URLS,
};
