import { get, post, del } from '../../../utils/api/api-fetch';

// fetch cart status
export const fetchCartStatus = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return get(`/api/v3/cart/status`, { queryParams });
};

// fetch cart
export const fetchCart = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return get(`/api/v3/cart`, { queryParams });
};

// update cart items
export const postCartItems = ({
  productId,
  quantityChange,
  variations: selectedOptions = [],
  shippingType,
  fulfillDate,
}) => {
  const payload = { productId, quantityChange, selectedOptions };
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return post(`/api/v3/cart/items`, payload, { queryParams });
};

// delete cart item(s) same variations
export const deleteCartItemsById = ({ id: itemId, shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return del(`/api/v3/cart/items/${itemId}`, { queryParams });
};

// delete cart
export const deleteCart = ({ shippingType, fulfillDate }) => {
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return del(`/api/v3/cart`, { queryParams });
};

// submit cart
export const postCartSubmission = ({ version, source: orderSource, shippingType, fulfillDate }) => {
  const payload = { version, orderSource };
  const queryParams = { shippingType };

  if (fulfillDate) {
    queryParams.fulfillDate = fulfillDate;
  }

  return post(`/api/v3/cart/submission`, payload, { queryParams });
};

// fetch cart submission status
export const fetchCartSubmissionStatus = ({ submissionId }) => get(`/api/v3/cart/submission/${submissionId}/status`);
