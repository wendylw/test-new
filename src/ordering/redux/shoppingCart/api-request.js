import { get } from '../../../utils/api/api-fetch';

export const fetchCart = ({ fulfillDate, shippingType, cartItemIds }) =>
  get(`/api/cart/checkInventory`, {
    queryParams: {
      /** fulfillDate must be a string */
      fulfillDate,
      shippingType,
      cartItemIds,
    },
  });
