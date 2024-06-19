import MembershipLevelIcon from '../../../../../../images/membership-level.svg';
import RewardsEarnedCashbackIcon from '../../../../../../images/rewards-earned-cashback.svg';

export const GET_REWARDS_MAX_LENGTH = 5;

export const MEMBER_TYPE_I18N_PARAM_KEYS = {
  CASHBACK_VALUE: 'cashbackValue',
};

export const NEW_MEMBER_TYPES = {
  DEFAULT: 'default',
  ENABLED_POINTS: 'enabledPoints',
};

export const NEW_MEMBER_ICONS = {
  [NEW_MEMBER_TYPES.DEFAULT]: MembershipLevelIcon,
  [NEW_MEMBER_TYPES.ENABLED_POINTS]: MembershipLevelIcon,
};

export const NEW_MEMBER_I18N_KEYS = {
  [NEW_MEMBER_TYPES.DEFAULT]: {
    titleI18nKey: 'DefaultNewMemberTitle',
    descriptionI18nKey: 'DefaultNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.ENABLED_POINTS]: {
    titleI18nKey: 'EnabledPointsNewMemberTitle',
    descriptionI18nKey: 'EnabledPointsNewMemberDescription',
  },
};

export const RETURNING_MEMBER_TYPES = {
  DEFAULT: 'default',
  THANKS_COMING_BACK: 'thanksComingBack',
  ENABLED_POINTS: 'enabledPoints',
};

export const RETURNING_MEMBER_ICONS = {
  [RETURNING_MEMBER_TYPES.ENABLED_POINTS]: RewardsEarnedCashbackIcon,
};

export const RETURNING_MEMBER_I18N_KEYS = {
  [RETURNING_MEMBER_TYPES.DEFAULT]: {
    titleI18nKey: 'DefaultReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.THANKS_COMING_BACK]: {
    titleI18nKey: 'ThanksComingBackReturningMemberTitle',
    descriptionI18nKey: 'ThanksComingBackReturningMemberDescription',
  },
  [RETURNING_MEMBER_TYPES.ENABLED_POINTS]: {
    titleI18nKey: 'EnabledPointsReturningMemberTitle',
  },
};

export const MEMBERSHIP_TIER_I18N_PARAM_KEYS = {
  TOTAL_SPEND_PRICE: 'totalSpendPrice',
  NEXT_TIER_SPENDING_THRESHOLD_PRICE: 'nextTierSpendingThresholdPrice',
  MAINTAIN_SPEND_PRICE: 'maintainSpendPrice',
  POINTS_TOTAL_EARNED: 'pointsTotalEarned',
  NEXT_TIER_POINTS_THRESHOLD: 'nextTierPointsThreshold',
  MAINTAIN_TOTAL_POINTS: 'maintainTotalPoints',
  NEXT_REVIEW_DATE: 'nextReviewDate',
  NEXT_TIER_NAME: 'nextTierName',
  CURRENT_TIER_NAME: 'currentTierName',
};

export const MEMBERSHIP_TIER_STATUS = {
  UNLOCK_NEXT_TIER: 'unlockNextTier',
  TIER_MAINTAIN: 'tierMaintain',
  POINTS_UNLOCK_NEXT_TIER: 'pointsUnlockNextTier',
  POINTS_TIER_MAINTAIN: 'pointsTierMaintain',
  TIER_COMPLETED: 'tierCompleted',
};

export const MEMBERSHIP_TIER_I18N_KEYS = {
  [MEMBERSHIP_TIER_STATUS.UNLOCK_NEXT_TIER]: {
    messageI18nKey: 'UnlockNextTierMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_SPENDING_THRESHOLD_PRICE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_NAME,
    ],
  },
  [MEMBERSHIP_TIER_STATUS.TIER_MAINTAIN]: {
    messageI18nKey: 'TierMaintainMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME,
    ],
  },
  [MEMBERSHIP_TIER_STATUS.POINTS_UNLOCK_NEXT_TIER]: {
    messageI18nKey: 'PointsUnlockNextTierMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.POINTS_TOTAL_EARNED,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_POINTS_THRESHOLD,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_NAME,
    ],
  },
  [MEMBERSHIP_TIER_STATUS.POINTS_TIER_MAINTAIN]: {
    messageI18nKey: 'PointsTierMaintainMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.POINTS_TOTAL_EARNED,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_TOTAL_POINTS,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME,
    ],
  },
  [MEMBERSHIP_TIER_STATUS.TIER_COMPLETED]: {
    messageI18nKey: 'TiersCompletedMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
    ],
  },
};

export const POINTS_REWARD_WIDTHS = {
  MIN_WIDTH: 250,
  MAX_WIDTH: 280,
};

export const CLAIMED_POINTS_REWARD_ERROR_CODES = {
  PROMO_IS_NOT_REDEEMABLE: '395279',
  INVALID_POINT_SOURCE: '395280',
  POINT_LOG_NOT_FOUND: '395281',
};
