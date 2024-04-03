export const POINTS_HISTORY_TYPES = {
  EARN: 'earn',
  RETURN: 'return',
  REFUND: 'refund',
  SPEND: 'spend',
  EXPIRE: 'expire',
  MANUAL_ADJUSTMENT: 'manual-adjustment',
};

export const POINTS_HISTORY_LOG_I18N_KEYS = {
  [POINTS_HISTORY_TYPES.EARN]: 'Earned',
  [POINTS_HISTORY_TYPES.RETURN]: 'Returned',
  [POINTS_HISTORY_TYPES.REFUND]: 'Refunded',
  [POINTS_HISTORY_TYPES.SPEND]: 'Spent',
  [POINTS_HISTORY_TYPES.EXPIRE]: 'Expired',
  [POINTS_HISTORY_TYPES.MANUAL_ADJUSTMENT]: 'Adjustment',
};

export const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
