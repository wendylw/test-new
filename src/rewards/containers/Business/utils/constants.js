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

/**
 * UI
 */
export const NATIVE_DARK_MODE = {
  TEXT_COLOR: '#ffffff',
  HEADER_BACKGROUND_COLOR: '#231651',
};
// end of UI
