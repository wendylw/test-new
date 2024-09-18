import Constants, { REFERRER_SOURCE_TYPES } from '../../../../../utils/constants';
import orderStatusCreated from '../../../../../images/order-success-1.svg';
import orderStatusAccepted from '../../../../../images/order-status-accepted.gif';
import orderStatusConfirmed from '../../../../../images/order-status-confirmed.gif';
import orderStatusDelivered from '../../../../../images/order-status-delivered.gif';
import orderStatusPaid from '../../../../../images/order-status-paid.gif';
import orderStatusPickedUp from '../../../../../images/order-status-picked-up.gif';
import orderStatusPendingPayment from '../../../../../images/order-status-pending-payment.gif';
import orderStatusPickedUpRainy from '../../../../../images/order-status-picked-up-rainy.gif';
import orderStatusCancelled from '../../../../../images/order-status-payment-cancelled.png';
import orderSuccessImage from '../../../../../images/order-success.png';

const { ORDER_STATUS } = Constants;

export const ORDER_SELF_DELIVERY_COURIER = 'selfDelivery';

export const ORDER_CANCELLATION_REASONS = {
  TAKING_TOO_LONG_TO_FIND_RIDER: 'takingTooLongToFindRider',
  MERCHANT_CALLED_TO_CANCEL: 'merchantCalledToCancel',
  WRONG_DELIVERY_INFORMATION: 'wrongDeliveryInformation',
  ORDERED_WRONG_ITEM: 'orderedWrongItem',
  CHANGE_OF_MIND: 'changeOfMind',
  OTHERS: 'others',
};

export const ORDER_DELAY_REASON_CODES = {
  RAMADAN: 'ramadan',
  BAD_WEATHER: 'badWeather',
};

export const BEFORE_PAID_STATUS_LIST = [
  ORDER_STATUS.CREATED,
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_VERIFICATION,
  ORDER_STATUS.PAYMENT_CANCELLED,
];

export const AFTER_PAID_STATUS_LIST = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.READY_FOR_DELIVERY,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.LOGISTICS_CONFIRMED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.PICKED_UP,
];

export const REFERRERS_REQUIRING_PROFILE = [
  REFERRER_SOURCE_TYPES.PAYMENT,
  REFERRER_SOURCE_TYPES.CASHBACK,
  REFERRER_SOURCE_TYPES.PAY_AT_COUNTER,
  REFERRER_SOURCE_TYPES.LOGIN,
];

export const CASHBACK_STATUS = {
  CLAIMED_REPEAT: 'Claimed_Repeat',
  CLAIMED_FIRST_TIME: 'Claimed_FirstTime',
  CLAIMED_NOT_FIRST_TIME: 'Claimed_NotFirstTime',
  CLAIMED_SOMEONE_ELSE: 'Claimed_Someone_Else',
  CLAIMED_PROCESSING: 'Claimed_Processing',
  CLAIMED: 'Claimed',
  CAN_CLAIM: 'Can_Claim',
  INVALID: 'Invalid',
};

export const CASHBACK_CLAIMED_STATUS_LIST = [
  CASHBACK_STATUS.CLAIMED_REPEAT,
  CASHBACK_STATUS.CLAIMED_FIRST_TIME,
  CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
  CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE,
  CASHBACK_STATUS.CLAIMED_PROCESSING,
  CASHBACK_STATUS.CLAIMED,
  // There is a bug on GET `/api/cashback` api
  // Will get "Invalid" status on calling GET `/api/cashback` again
  // Ticket: FB-3448
  CASHBACK_STATUS.INVALID,
];

export const CASHBACK_CAN_CLAIM_STATUS_LIST = [CASHBACK_STATUS.CAN_CLAIM];

export const PROFILE_DISPLAY_DELAY_DURATION = {
  [REFERRER_SOURCE_TYPES.LOGIN]: 1000,
  DEFAULT: 3000,
};

export const RAINY_IMAGES_MAPPING = {
  [ORDER_STATUS.CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUpRainy,
};

export const DELIVERY_STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PAID]: orderStatusPaid,
  [ORDER_STATUS.ACCEPTED]: orderStatusAccepted,
  [ORDER_STATUS.CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUp,
  [ORDER_STATUS.DELIVERED]: orderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: orderStatusCancelled,
};

export const NOT_DELIVERY_STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.CREATED]: orderStatusCreated,
  [ORDER_STATUS.PENDING_PAYMENT]: orderStatusPendingPayment,
  [ORDER_STATUS.PAID]: orderSuccessImage,
  [ORDER_STATUS.ACCEPTED]: orderSuccessImage,
  [ORDER_STATUS.CONFIRMED]: orderSuccessImage,
  [ORDER_STATUS.PICKED_UP]: orderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: orderStatusCancelled,
  [ORDER_STATUS.PAYMENT_CANCELLED]: orderStatusCancelled,
};
