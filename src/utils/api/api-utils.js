import Utils from '../../utils/utils';

export class ApiError extends Error {
  constructor(code, message, { extraInfo, response, responseBody } = {}) {
    super();

    this.code = code;
    this.message = message;
    this.extraInfo = extraInfo;
    this.response = response;
    this.responseBody = responseBody;
  }
}

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

export function getClientSource() {
  const isIOS = Utils.isIOSWebview();
  const isAndroid = Utils.isAndroidWebview();

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
