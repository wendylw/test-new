export const POINTS_HISTORY_TYPES = {
  EARN: 'earn',
  RETURN: 'return',
  REFUND: 'refund',
  SPEND: 'spend',
  EXPIRE: 'expire',
  MANUAL_ADJUSTMENT: 'manual-adjustment',
};

export const POINTS_HISTORY_REDUCE_TYPES = [
  POINTS_HISTORY_TYPES.RETURN,
  POINTS_HISTORY_TYPES.REFUND,
  POINTS_HISTORY_TYPES.SPEND,
  POINTS_HISTORY_TYPES.EXPIRE,
];

export const POINTS_HISTORY_LOG_I18N_KEYS = {
  [POINTS_HISTORY_TYPES.EARN]: 'Earn',
  [POINTS_HISTORY_TYPES.RETURN]: 'Returned',
  [POINTS_HISTORY_TYPES.REFUND]: 'Refunded',
  [POINTS_HISTORY_TYPES.SPEND]: 'Spend',
  [POINTS_HISTORY_TYPES.EXPIRE]: 'PointsHistoryExpired',
  [POINTS_HISTORY_TYPES.MANUAL_ADJUSTMENT]: 'ManualAdjustment',
};

export const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
