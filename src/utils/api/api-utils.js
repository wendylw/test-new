export const API_INFO = {
  getStores: (businessName, storeId) => ({
    url: `/api/stores/${businessName}${storeId ? `/${storeId}` : ''}`,
  }),
  getCartInventoryState: (cartItemIds, shippingType, fulfillDate) => ({
    url: '/api/cart/checkInventory',
    queryParams: {
      /** fulfillDate must be a string */
      fulfillDate,
      cartItemIds,
      shippingType,
    },
  }),
  getOrderStatus: orderId => ({
    url: `/api/transactions/${orderId}/status`,
  }),
  updateOrderShippingType: orderId => ({
    url: `/api/transactions/${orderId}/change-shipping-type`,
  }),
};
