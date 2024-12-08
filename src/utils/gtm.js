import Utils from './utils';

export const gtmEventTracking = (eventName, data, callback) => {
  window.dataLayer = window.dataLayer || [];

  if (typeof callback === 'function') {
    if (window.google_tag_manager) {
      return window.dataLayer.push({
        ...data,
        event: eventName,
        eventCallback: id => (id === process.env.REACT_APP_GOOGLE_TAG_MANAGER_ID ? callback() : null),
        eventTimeout: 2000,
      });
    }
    return callback();
  }

  return window.dataLayer.push({
    ...data,
    event: eventName,
  });
};

export const gtmSetUserProperties = ({ onlineStoreInfo, userInfo, store }) => {
  let onlineStoreInfoForGtm = {};
  let userInfoForGtm = {};
  let selectedStoreInfoForGtm = {};

  if (onlineStoreInfo && Object.keys(onlineStoreInfo).length) {
    if (onlineStoreInfo.analyticTools) {
      onlineStoreInfo.analytics = onlineStoreInfo.analyticTools.reduce(
        (codeMap, { name, trackingId }) => ({
          ...codeMap,
          [name]: trackingId,
        }),
        {}
      );
    }
    onlineStoreInfoForGtm = {
      merchantID: onlineStoreInfo.id,
      merchantIndustry: onlineStoreInfo.businessType,
      country: onlineStoreInfo.country,
      currency: onlineStoreInfo.currency,
      gaEnabled: !!(onlineStoreInfo.analytics && onlineStoreInfo.analytics.GA),
      fbPixelEnabled: !!(onlineStoreInfo.analytics && onlineStoreInfo.analytics.FB),
      gaID: onlineStoreInfo.analytics && onlineStoreInfo.analytics.GA,
      fbPixelID: onlineStoreInfo.analytics && onlineStoreInfo.analytics.FB,
    };
  }

  if (userInfo && Object.keys(userInfo).length) {
    userInfoForGtm = {
      userID: userInfo.consumerId,
      isGuest: !(userInfo && userInfo.consumerId),
      phoneNumber: Utils.getLocalStorageVariable('user.p'),
    };
  }

  if (store && store.id) {
    selectedStoreInfoForGtm = {
      storeId: store.id,
    };
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(
    // eslint-disable-next-line prefer-object-spread
    Object.assign(
      {
        event: 'initial',
      },
      onlineStoreInfoForGtm,
      userInfoForGtm,
      selectedStoreInfoForGtm
    )
  );
};

export const gtmSetPageViewData = data => {
  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push(data);
};

export const GTM_TRACKING_EVENTS = {
  VIEW_PRODUCT: 'viewProduct',
  ADD_TO_CART: 'addToCart',
  INITIATE_CHECKOUT: 'initiateCheckout',
  ORDER_CONFIRMATION: 'orderConfirmation',
};

export const STOCK_STATUS_MAPPING = {
  outOfStock: 'out of stock',
  inStock: 'in stock',
  lowStock: 'low stock',
  unavailable: 'unavailable',
  notTrackInventory: 'not track Inventory',
};
