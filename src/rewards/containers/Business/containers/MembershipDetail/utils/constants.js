import MembershipLevelIcon from '../../../../../../images/membership-level.svg';
import RewardsEarnedCashbackIcon from '../../../../../../images/rewards-earned-cashback.svg';
import RewardsWarningIcon from '../../../../../../images/rewards-warning.svg';
import { CLAIMED_CASHBACK_STATUS } from '../../../utils/constants';

export const CLAIMED_POINTS_REWARD_ERROR_CODES = {
  395279: 'promotionIsNotRedeemable',
  395280: 'insufficientPoints',
  395281: 'insufficientPoints',
};

export const CLAIMED_POINTS_REWARD_ERROR_I18N_KEYS = {
  [CLAIMED_POINTS_REWARD_ERROR_CODES['395279']]: {
    titleI18nKey: 'PromotionIsNotRedeemableTitle',
    descriptionI18nKey: 'PromotionIsNotRedeemableDescription',
  },
  [CLAIMED_POINTS_REWARD_ERROR_CODES['395280']]: {
    titleI18nKey: 'InsufficientPointsTitle',
    descriptionI18nKey: 'InsufficientPointsDescription',
  },
  [CLAIMED_POINTS_REWARD_ERROR_CODES['395281']]: {
    titleI18nKey: 'InsufficientPointsTitle',
    descriptionI18nKey: 'InsufficientPointsDescription',
  },
};

export const MEMBER_TYPE_I18N_PARAM_KEYS = {
  CASHBACK_VALUE: 'cashbackValue',
};

export const NEW_MEMBER_TYPES = {
  DEFAULT: 'default',
  ENABLED_POINTS: 'enabledPoints',
  REDEEM_CASHBACK: 'redeemCashback',
  EARNED_CASHBACK: 'earnedCashback',
  CLAIMED_REPEAT: 'claimedRepeat',
  CLAIMED_SOMEONE_ELSE: 'claimedSomeoneElse',
  NOT_CLAIMED_EXPIRED: 'notClaimedExpired',
  NOT_CLAIMED_CANCELLED: 'notClaimedCancelled',
  NOT_CLAIMED_REACH_LIMIT: 'notClaimedReachLimit',
  NOT_CLAIMED_REACH_MERCHANT_LIMIT: 'notClaimedReachMerchantLimit',
  NOT_CLAIMED_DEFAULT: 'notClaimedDefault',
};

export const RETURNING_MEMBER_TYPES = {
  DEFAULT: 'default',
  ENABLED_POINTS: 'enabledPoints',
  REDEEM_CASHBACK: 'redeemCashback',
  THANKS_COMING_BACK: 'thanksComingBack',
  EARNED_CASHBACK: 'earnedCashback',
  CLAIMED_REPEAT: 'claimedRepeat',
  CLAIMED_SOMEONE_ELSE: 'claimedSomeoneElse',
  NOT_CLAIMED_EXPIRED: 'notClaimedExpired',
  NOT_CLAIMED_REACH_LIMIT: 'notClaimedReachLimit',
  NOT_CLAIMED_CANCELLED: 'notClaimedCancelled',
  NOT_CLAIMED_REACH_MERCHANT_LIMIT: 'notClaimedReachMerchantLimit',
  NOT_CLAIMED_DEFAULT: 'notClaimedDefault',
};

export const NEW_MEMBER_CASHBACK_STATUS_TYPES = {
  [CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME]: NEW_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME]: NEW_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_PROCESSING]: NEW_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: NEW_MEMBER_TYPES.CLAIMED_REPEAT,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: NEW_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_EXPIRED]: NEW_MEMBER_TYPES.NOT_CLAIMED_EXPIRED,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_CANCELLED]: NEW_MEMBER_TYPES.NOT_CLAIMED_CANCELLED,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_NO_TRANSACTION]: NEW_MEMBER_TYPES.NOT_CLAIMED_DEFAULT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: NEW_MEMBER_TYPES.NOT_CLAIMED_DEFAULT,
};

export const NEW_MEMBER_ICONS = {
  [NEW_MEMBER_TYPES.DEFAULT]: MembershipLevelIcon,
  [NEW_MEMBER_TYPES.ENABLED_POINTS]: MembershipLevelIcon,
  [NEW_MEMBER_TYPES.REDEEM_CASHBACK]: MembershipLevelIcon,
  [NEW_MEMBER_TYPES.EARNED_CASHBACK]: RewardsEarnedCashbackIcon,
  [NEW_MEMBER_TYPES.CLAIMED_REPEAT]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.NOT_CLAIMED_CANCELLED]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.NOT_CLAIMED_DEFAULT]: RewardsWarningIcon,
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
  [NEW_MEMBER_TYPES.REDEEM_CASHBACK]: {
    titleI18nKey: 'RedeemCashbackNewMemberTitle',
    descriptionI18nKey: 'RedeemCashbackNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.EARNED_CASHBACK]: {
    titleI18nKey: 'EarnedCashbackNewMemberTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.CASHBACK_VALUE],
  },
  [NEW_MEMBER_TYPES.CLAIMED_REPEAT]: {
    titleI18nKey: 'ClaimedCashbackRepeatNewMemberTitle',
    descriptionI18nKey: 'ClaimedCashbackRepeatNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE]: {
    titleI18nKey: 'ClaimedCashbackBySomeElseNewMemberTitle',
    descriptionI18nKey: 'ClaimedCashbackBySomeElseNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.NOT_CLAIMED_EXPIRED]: {
    titleI18nKey: 'NotClaimExpiredNewMemberTitle',
    descriptionI18nKey: 'NotClaimExpiredNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.NOT_CLAIMED_CANCELLED]: {
    titleI18nKey: 'NotClaimCancelledNewMemberTitle',
    descriptionI18nKey: 'NotClaimCancelledNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT]: {
    titleI18nKey: 'NotClaimReachLimitNewMemberTitle',
    descriptionI18nKey: 'NotClaimReachLimitNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: {
    titleI18nKey: 'NotClaimReachMerchantLimitNewMemberTitle',
    descriptionI18nKey: 'NotClaimReachMerchantLimitNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.NOT_CLAIMED_DEFAULT]: {
    titleI18nKey: 'NotClaimDefaultNewMemberTitle',
    descriptionI18nKey: 'NotClaimDefaultNewMemberDescription',
  },
};

export const RETURNING_MEMBER_CASHBACK_STATUS_TYPES = {
  [CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME]: RETURNING_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME]: RETURNING_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_PROCESSING]: RETURNING_MEMBER_TYPES.EARNED_CASHBACK,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: RETURNING_MEMBER_TYPES.CLAIMED_REPEAT,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: RETURNING_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_EXPIRED]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_EXPIRED,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_CANCELLED]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_CANCELLED,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_NO_TRANSACTION]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_DEFAULT,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: RETURNING_MEMBER_TYPES.NOT_CLAIMED_DEFAULT,
};

export const RETURNING_MEMBER_ICONS = {
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.ENABLED_POINTS]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.EARNED_CASHBACK]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.CLAIMED_REPEAT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_CANCELLED]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_DEFAULT]: RewardsWarningIcon,
};

export const RETURNING_MEMBER_I18N_KEYS = {
  [RETURNING_MEMBER_TYPES.DEFAULT]: {
    titleI18nKey: 'DefaultReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.ENABLED_POINTS]: {
    titleI18nKey: 'EnabledPointsReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: {
    titleI18nKey: 'RedeemCashbackReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.THANKS_COMING_BACK]: {
    titleI18nKey: 'ThanksComingBackReturningMemberTitle',
    descriptionI18nKey: 'ThanksComingBackReturningMemberDescription',
  },
  [RETURNING_MEMBER_TYPES.EARNED_CASHBACK]: {
    titleI18nKey: 'EarnedCashbackReturningMemberTitle',
    descriptionI18nKey: 'EarnedCashbackReturningMemberDescription',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.CASHBACK_VALUE],
  },
  [RETURNING_MEMBER_TYPES.CLAIMED_REPEAT]: {
    titleI18nKey: 'ClaimedCashbackRepeatReturningMemberTitle',
    descriptionI18nKey: 'ClaimedCashbackRepeatReturningMemberDescription',
  },
  [RETURNING_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE]: {
    titleI18nKey: 'ClaimedCashbackBySomeElseReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_EXPIRED]: {
    titleI18nKey: 'NotClaimExpiredReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_CANCELLED]: {
    titleI18nKey: 'NotClaimCancelledReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT]: {
    titleI18nKey: 'NotClaimReachLimitReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: {
    titleI18nKey: 'NotClaimReachMerchantLimitReturningMemberTitle',
  },
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_DEFAULT]: {
    titleI18nKey: 'NotClaimDefaultReturningMemberTitle',
  },
};

export const MEMBERSHIP_LEVEL_I18N_PARAM_KEYS = {
  UNLOCK_COLLECT_POINTS: 'unlockCollectPoints',
  MAINTAIN_COLLECT_POINTS: 'maintainCollectPoints',
  UNLOCK_SPEND_PRICE: 'unlockSpendPrice',
  SPENDING_THRESHOLD_PRICE: 'spendingThresholdPrice',
  MAINTAIN_SPEND_PRICE: 'maintainSpendPrice',
  NEXT_REVIEW_DATE: 'nextReviewDate',
  NEXT_LEVEL_NAME: 'nextLevelName',
  CURRENT_LEVEL_NAME: 'currentLevelName',
};

export const MEMBERSHIP_LEVEL_STATUS = {
  POINTS_UNLOCK_NEXT_LEVEL: 'pointsUnlockNextLevel',
  POINTS_LEVEL_MAINTAIN: 'pointsLevelMaintain',
  UNLOCK_NEXT_LEVEL: 'unlockNextLevel',
  LEVEL_COMPLETED: 'levelCompleted',
  LEVEL_MAINTAIN: 'levelMaintain',
};

export const MEMBERSHIP_LEVEL_I18N_KEYS = {
  [MEMBERSHIP_LEVEL_STATUS.POINTS_UNLOCK_NEXT_LEVEL]: {
    messageI18nKey: 'PointsUnlockNextLevelMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_COLLECT_POINTS,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_LEVEL_NAME,
    ],
  },
  [MEMBERSHIP_LEVEL_STATUS.POINTS_LEVEL_MAINTAIN]: {
    messageI18nKey: 'PointsLevelMaintainMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.MAINTAIN_COLLECT_POINTS,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.CURRENT_LEVEL_NAME,
    ],
  },
  [MEMBERSHIP_LEVEL_STATUS.UNLOCK_NEXT_LEVEL]: {
    messageI18nKey: 'UnlockNextLevelMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_SPEND_PRICE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_LEVEL_NAME,
    ],
  },
  [MEMBERSHIP_LEVEL_STATUS.LEVEL_COMPLETED]: {
    messageI18nKey: 'LevelCompletedMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.CURRENT_LEVEL_NAME,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
    ],
  },
  [MEMBERSHIP_LEVEL_STATUS.LEVEL_MAINTAIN]: {
    messageI18nKey: 'LevelMaintainMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.CURRENT_LEVEL_NAME,
    ],
  },
};

export const NEW_MEMBERSHIP_LEVEL_I18N_KEYS = {
  [MEMBERSHIP_LEVEL_STATUS.UNLOCK_NEXT_LEVEL]: {
    messageI18nKey: 'NewUnlockNextLevelMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_SPEND_PRICE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.SPENDING_THRESHOLD_PRICE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
      MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_LEVEL_NAME,
    ],
  },
};
