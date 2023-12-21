import { SHIPPING_TYPES, SOURCE_TYPE } from '../../../../../common/utils/constants';
import { REFERRER_SOURCE_TYPES } from '../../../../../utils/constants';

export const STORE_REVIEW_HIGHEST_RATING = 5;

export const STORE_REVIEW_COMMENT_CHAR_MAX = 4050;

export const STORE_REVIEW_ONE_SECOND_DELAY = 1000;

export const STORE_REVIEW_SUCCESS_TOAST_DURATION = 5; // 5 seconds

export const STORE_REVIEW_SHIPPING_TYPES = {
  [SHIPPING_TYPES.DINE_IN]: 'DineIn',
  [SHIPPING_TYPES.TAKE_AWAY]: 'Takeaway',
  [SHIPPING_TYPES.DELIVERY]: 'Delivery',
  [SHIPPING_TYPES.PICKUP]: 'Pickup',
};

export const STORE_REVIEW_SOURCE_TYPE_MAPPING = {
  [SOURCE_TYPE.PUSH_NOTIFICATION]: 'Push Notification',
  [SOURCE_TYPE.SMS]: 'SMS',
  [REFERRER_SOURCE_TYPES.THANK_YOU]: 'Thank You Page',
};

export const STORE_REVIEW_ERROR_CODES = {
  INVALID_RECEIPT_NUMBER: '40002',
};
