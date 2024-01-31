export const CLAIMED_CASHBACK_STATUS = {
  // can claim status
  CLAIMED_FIRST_TIME: 'Claimed_FirstTime',
  CLAIMED_PROCESSING: 'Claimed_Processing',
  CLAIMED_NOT_FIRST_TIME: 'Claimed_NotFirstTime',
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
