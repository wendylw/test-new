import { get, post } from '../../../../../utils/api/api-fetch';

export const fetchStockStatus = ({ fulfillDate, shippingType, cartItemIds }) =>
  get(`/api/cart/checkInventory`, {
    queryParams: {
      /** fulfillDate must be a string */
      fulfillDate,
      shippingType,
      cartItemIds,
    },
  });

export const applyCashback = () => post('/api/cart/apply-cashback');

export const unapplyCashback = () => post('/api/cart/unapply-cashback');
