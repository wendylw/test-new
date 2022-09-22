import { SHIPPING_TYPES, SOURCE_TYPE } from '../../../../../common/utils/constants';

export const STORE_REVIEW_HIGH_RATING = 4;

export const STORE_REVIEW_COMMENT_CHAR_MAX = 4050;

export const STORE_REVIEW_SHIPPING_TYPES = {
  [SHIPPING_TYPES.DINE_IN]: 'DineIn',
  [SHIPPING_TYPES.TAKE_AWAY]: 'Takeaway',
  [SHIPPING_TYPES.DELIVERY]: 'Delivery',
  [SHIPPING_TYPES.PICKUP]: 'Pickup',
};

export const STORE_REVIEW_SOURCE_TYPE_MAPPING = {
  [SOURCE_TYPE.PUSH_NOTIFICATION]: 'Push Notification',
  [SOURCE_TYPE.SMS]: 'SMS',
  [SOURCE_TYPE.THANK_YOU]: 'Thank You Page',
};
