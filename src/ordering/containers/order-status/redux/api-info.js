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

export const getPayLaterOrderStatus = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}/status`);

export const postPayLaterOrderSubmission = (receiptNumber, data) =>
  post(`/api/v3/transactions/${receiptNumber}/submission`, data);

export const postFoodCourtIdHashCode = (foodCourtId, payload) => post(`/api/ordering/stores/${foodCourtId}`, payload);

export const getOrderStoreReview = (orderId, offline) =>
  get(`/api/transactions/${orderId}/review`, { queryParams: { offline } });

export const postOrderStoreReview = ({ orderId, rating, comments, allowMerchantContact, offline }) =>
  post(`/api/transactions/${orderId}/review`, { rating, comments, allowMerchantContact, offline });
