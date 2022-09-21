import { SHIPPING_TYPES } from '../../../common/utils/constants';

export const ORDER_PAYMENT_METHODS = {
  OFFLINE: 'Offline',
  ONLINE: 'Online',
};

export const STORE_REVIEW_SHIPPING_TYPES = {
  [SHIPPING_TYPES.DINE_IN]: 'DineIn',
  [SHIPPING_TYPES.TAKE_AWAY]: 'Takeaway',
  [SHIPPING_TYPES.DELIVERY]: 'Delivery',
  [SHIPPING_TYPES.PICKUP]: 'Pickup',
  dinein: 'DineIn',
};
