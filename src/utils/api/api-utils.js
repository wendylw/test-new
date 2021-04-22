import _isObject from 'lodash/isObject';

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
};

export function getClientSource() {
  const isIOS = Boolean(
    window.webkit && window.webkit.messageHandlers.shareAction && window.webkit.messageHandlers.shareAction.postMessage
  );
  const isAndroid = Boolean(window.androidInterface);
  const source = {
    name: 'web',
    web: !isIOS && !isAndroid,
    ios: isIOS,
    android: isAndroid,
  };

  if (isIOS) {
    source.name = 'iOS';
  }

  if (isAndroid) {
    source.name = 'Android';
  }

  return source;
}
