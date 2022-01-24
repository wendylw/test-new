export const API_INFO = {
  getStores: (businessName, storeId) => ({
    url: `/api/stores/${businessName}${storeId ? `/${storeId}` : ''}`,
  }),
  getOrderStatus: orderId => ({
    url: `/api/transactions/${orderId}/status`,
  }),
  updateOrderShippingType: orderId => ({
    url: `/api/transactions/${orderId}/change-shipping-type`,
  }),
};

export const API_REQUEST_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};
