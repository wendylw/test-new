import { get, post, del } from '../../../utils/api/api-fetch';

// fetch cart status
export const fetchCartStatus = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return get(`/api/v3/cart/version`, { queryParams });
};

// fetch cart
export const fetchCart = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return get(`/api/v3/cart`, { queryParams });
};

// update cart
export const updateCart = ({ productId, quantityChange, variations = [], shippingType, fulfillDate }) => {
  const payload = { productId, quantityChange, variations };
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return post(`/api/v3/cart/items`, payload, { queryParams });
};

// delete cart
export const deleteCart = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return del(`/api/v3/cart`, { queryParams });
};

// delete cart item(s) same variations
export const deleteCartItemsById = ({ id: itemId, shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return del(`/api/v3/cart/items/${itemId}`, { queryParams });
};

// submit cart
export const submitCart = ({ version, orderSource, shippingType, fulfillDate }) => {
  const payload = { version, orderSource };
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return post(`/api/v3/cart/submission`, payload, { queryParams });
};

// fetch cart submission status
export const fetchCartSubmissionStatus = ({ id: cartId, submissionId }) =>
  get(`/api/v3/cart/${cartId}/submission/${submissionId}/status`);
