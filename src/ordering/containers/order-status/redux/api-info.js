import { post, get } from '../../../../utils/api/api-fetch';

export const API_INFO = {
  getOrderDetail: () => ({
    url: `/api/gql/Order`,
  }),
  getOrderStatus: orderId => ({
    url: `/api/transactions/${orderId}/status`,
  }),
  cancelOrder: orderId => ({
    url: `/api/v3/transactions/${orderId}/status/cancel`,
  }),
  updateOrderShippingType: orderId => ({
    url: `/api/v3/transactions/${orderId}/change-shipping-type`,
  }),
  getCashbackInfo: (orderId, source) => ({
    url: `/api/cashback`,
    queryParams: {
      receiptNumber: orderId,
      source,
    },
  }),
  createCashbackInfo: () => ({
    url: `/api/cashback`,
  }),
  getStoreIdHashCode: storeId => ({
    url: `/api/ordering/stores/${storeId}`,
    queryParams: {
      a: 'redirectTo',
    },
  }),
  createStoreIdTableIdHashCode: storeId => ({
    url: `/api/ordering/stores/${storeId}`,
  }),
};

export const postFoodCourtIdHashCode = (foodCourtId, payload) => {
  return post(`/api/ordering/stores/${foodCourtId}`, payload);
};

export const getOrderStoreReview = orderId => get(`/api/transactions/${orderId}/review`);

export const postOrderStoreReview = ({ orderId, rating, comments, allowMerchantContact }) =>
  post(`/api/transactions/${orderId}/review`, { rating, comments, allowMerchantContact });
