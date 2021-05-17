export const API_INFO = {
  getOrderDetail: () => ({
    url: `/api/gql/Order`,
  }),
  getOrderStatus: orderId => ({
    url: `/api/transactions/${orderId}/status`,
  }),
  cancelOrder: orderId => ({
    url: `/api/transactions/${orderId}/status/cancel`,
  }),
  updateOrderShippingType: orderId => ({
    url: `/api/transactions/${orderId}/change-shipping-type`,
  }),
};
