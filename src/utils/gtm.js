import Utils from './utils';

export const gtmEventTracking = (eventName, data, callback) => {
  window.dataLayer = window.dataLayer || [];

  if (typeof callback === 'function') {
    if (window.google_tag_manager) {
      return window.dataLayer.push({
        ...data,
        event: eventName,
        eventCallback: callback,
        eventTimeout: 2000,
      });
    } else {
      return callback();
    }
  }

  return window.dataLayer.push({
    ...data,
    event: eventName,
  });
};

export const gtmSetUserProperties = (onlineStoreInfo, userInfo) => {
  let storeInfoForGtm = {};
  let userInfoForGtm = {};

  if (onlineStoreInfo && Object.keys(onlineStoreInfo).length) {
    storeInfoForGtm = {
      merchantID: onlineStoreInfo.id,
      merchantIndustry: onlineStoreInfo.businessType,
      country: onlineStoreInfo.country,
      currency: onlineStoreInfo.currency,
      gaEnabled: !!(onlineStoreInfo.analytics && onlineStoreInfo.analytics.GA),
      fbPixelEnabled: !!(onlineStoreInfo.analytics && onlineStoreInfo.analytics.FB),
      gaID: onlineStoreInfo.analytics && onlineStoreInfo.analytics.GA,
      fbPixelID: onlineStoreInfo.analytics && onlineStoreInfo.analytics.FB,
    }
  }

  if (userInfo && Object.keys(userInfo).length) {
    userInfoForGtm = {
      userID: userInfo.consumerId,
      isGuest: !!(userInfo && userInfo.consumerId),
      phoneNumber: Utils.getLocalStorageVariable('user.p'),
    }
  }

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer.push(Object.assign({}, storeInfoForGtm, userInfoForGtm));
};

export const GTM_TRACKING_EVENTS = {
  VIEW_PRODUCT: 'viewProduct',
  ADD_TO_CART: 'addToCart',
  INITIATE_CHECKOUT: 'initiateCheckout',
  ORDER_CONFIRMATION: 'orderConfirmation',
};
