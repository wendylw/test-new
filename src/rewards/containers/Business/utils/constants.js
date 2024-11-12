import { PROMO_VOUCHER_STATUS } from '../../../../common/utils/constants';

export const DEFAULT_NEAR_EXPIRY_DAYS = 8;

export const CLAIMED_CASHBACK_STATUS = {
  // can claim status
  CLAIMED_FIRST_TIME: 'Claimed_FirstTime',
  CLAIMED_NOT_FIRST_TIME: 'Claimed_NotFirstTime',
  CLAIMED_PROCESSING: 'Claimed_Processing',
  // can't claim status
  CLAIMED_SOMEONE_ELSE: 'Claimed_Someone_Else',
  NOT_CLAIMED_EXPIRED: 'NotClaimed_Expired',
  CLAIMED_REPEAT: 'Claimed_Repeat',
  NOT_CLAIMED_REACH_MERCHANT_LIMIT: 'NotClaimed_ReachMerchantLimit',
  NOT_CLAIMED_REACH_LIMIT: 'NotClaimed_ReachLimit',
  NOT_CLAIMED_CANCELLED: 'NotClaimed_Cancelled',
  // default not claimed status
  NOT_CLAIMED_NO_TRANSACTION: 'NotClaimed_NoTransaction',
  NOT_CLAIMED: 'NotClaimed',
};

export const CLAIMED_POINTS_STATUS = {
  SUCCESS: 'Success',
  CLAIMED_SOMEONE_ELSE: 'Failed_SomeoneElse',
  NOT_CLAIMED_REACH_LIMIT: 'Failed_ReachDailyLimit',
  CLAIMED_REPEAT: 'Failed_DuplicateClaim',
  FAILED: 'Failed',
};

export const CLAIMED_TRANSACTION_STATUS = {
  SUCCESS: 'Success',
  FAILED_ORDER_NOTFOUND: 'Failed_OrderNotFound',
  FAILED_EXPIRED: 'Failed_Expired',
  FAILED_CANCELLED_OR_REFUND: 'Failed_CancelledOrRefund',
  FAILED_CUSTOMER_NOT_MATCH: 'Failed_CustomerNotMatch',
  FAILED_BIND_CUSTOMER_FAILED: 'Failed_BindCustomerFailed',
};

export const REWARDS_APPLIED_ALL_STORES = 'All';

export const REWARDS_APPLIED_SOURCES = {
  POS: 1,
  E_Commerce: 2,
  Beep_Pickup: 5,
  Beep_Delivery: 6,
  Beep_Takeaway: 7,
  Beep_DineIn: 8,
};

/**
 * i18n keys
 */
export const UNIQUE_PROMO_STATUS_I18KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};

export const REWARDS_APPLIED_SOURCE_I18KEYS = {
  [REWARDS_APPLIED_SOURCES.POS]: 'POS',
  [REWARDS_APPLIED_SOURCES.E_Commerce]: 'Ecommerce',
  [REWARDS_APPLIED_SOURCES.Beep_Pickup]: 'BeepPickup',
  [REWARDS_APPLIED_SOURCES.Beep_Delivery]: 'BeepDelivery',
  [REWARDS_APPLIED_SOURCES.Beep_Takeaway]: 'BeepTakeaway',
  [REWARDS_APPLIED_SOURCES.Beep_DineIn]: 'BeepDineIn',
};
/* end of i18n keys */
