export const CASHBACK_HISTORY_TYPES = {
  EARNED: 'earned',
  EXPENSE: 'expense',
  PENDING: 'pending',
  EXPIRED: 'expired',
  ADJUSTMENT: 'adjustment',
};

export const CASHBACK_HISTORY_LOG_I18N_KEYS = {
  [CASHBACK_HISTORY_TYPES.EARNED]: 'Earned',
  [CASHBACK_HISTORY_TYPES.EXPENSE]: 'Redeemed',
  [CASHBACK_HISTORY_TYPES.PENDING]: 'Pending',
  [CASHBACK_HISTORY_TYPES.EXPIRED]: 'Expired',
  [CASHBACK_HISTORY_TYPES.ADJUSTMENT]: 'Adjustment',
};

export const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const REWARD_TYPE = {
  CASHBACK: 'cashback',
  STORE_CREDITS: 'storeCredits',
};
