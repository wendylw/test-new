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

export const GTM_TRACKING_EVENTS = {
  VIEW_PRODUCT: 'viewProduct',
  ADD_TO_CART: 'addToCart',
  INITIATE_CHECKOUT: 'initiateCheckout',
  ORDER_CONFIRMATION: 'orderConfirmation',
};
