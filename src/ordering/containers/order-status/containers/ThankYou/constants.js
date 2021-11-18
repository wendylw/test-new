import Constants from '../../../../../utils/constants';

const { ORDER_STATUS } = Constants;

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
};

export const BEFORE_PAID_STATUS_LIST = [
  ORDER_STATUS.CREATED,
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_VERIFICATION,
  ORDER_STATUS.PAYMENT_CANCELLED,
];

export const CASHBACK_CAN_CLAIM = 'Can_Claim';
export const CASHBACK_HAS_CLAIMED = 'Invalid';
