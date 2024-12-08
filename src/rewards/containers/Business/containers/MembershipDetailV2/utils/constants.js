import MembershipLevelIcon from '../../../../../../images/membership-level.svg';
import RewardsEarnedCashbackIcon from '../../../../../../images/rewards-earned-cashback.svg';
import RewardsEarnedPointsIcon from '../../../../../../images/rewards-earned-points.svg';
import RewardsWarningIcon from '../../../../../../images/rewards-warning.svg';
import RewardsFailedIcon from '../../../../../../images/rewards-failed.svg';
import { CLAIMED_CASHBACK_STATUS } from '../../../utils/constants';

export const GET_REWARDS_MAX_LENGTH = 5;

export const UNIQUE_PROMO_BANNER_LIST_LIMIT = 2;

export const CLAIMED_ORDER_REWARD_NAMES = {
  CASHBACK: 'cashback',
  POINTS: 'points',
};

export const MEMBER_TYPE_I18N_PARAM_KEYS = {
  CASHBACK_VALUE: 'cashbackValue',
  RECEIPT_CASHBACK_VALUE: 'receiptCashbackValue',
  RECEIPT_POINTS_VALUE: 'receiptPointsValue',
  RECEIPT_REWARDS: 'receiptRewards',
  RECEIPT_REWARD_TYPE: 'receiptRewardType',
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
  RECEIPT_EARNED_POINTS: 'receiptEarnedPoints',
  RECEIPT_EARNED_CASHBACK: 'receiptEarnedCashback',
  RECEIPT_EARNED_POINTS_CASHBACK: 'receiptEarnedPointsCashback',
  RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION: 'receiptNotClaimedCancelledNoTransaction',
  RECEIPT_NOT_CLAIMED_EXPIRED: 'receiptNotClaimedExpired',
  RECEIPT_CLAIMED_SOME_ELSE: 'receiptClaimedSomeElse',
  RECEIPT_NOT_CLAIMED_REACH_LIMIT: 'receiptNotClaimedReachLimit',
  RECEIPT_CLAIMED_REPEAT: 'receiptClaimedRepeat',
  RECEIPT_NOT_CLAIMED_DEFAULT: 'receiptNotClaimedDefault',
  RECEIPT_BIND_CUSTOMER_FAILED: 'receiptBindCustomerFailed',
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
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK]: RewardsEarnedCashbackIcon,
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS]: RewardsEarnedPointsIcon,
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK]: [RewardsEarnedPointsIcon, RewardsEarnedCashbackIcon],
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE]: RewardsFailedIcon,
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT]: RewardsFailedIcon,
  [NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT]: RewardsFailedIcon,
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT]: RewardsWarningIcon,
  [NEW_MEMBER_TYPES.RECEIPT_BIND_CUSTOMER_FAILED]: RewardsWarningIcon,
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
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS]: {
    titleI18nKey: 'ReceiptEarnedOnlyPointsTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE],
  },
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK]: {
    titleI18nKey: 'ReceiptEarnedOnlyCashbackTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE],
  },
  [NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK]: {
    titleI18nKey: 'ReceiptEarnedPointsAndCashbackTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [
      MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE,
      MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE,
    ],
  },
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION]: {
    titleI18nKey: 'ReceiptNotClaimedCancelledNoTransactionTitle',
    descriptionI18nKey: 'YouAreNowAMember',
  },
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED]: {
    titleI18nKey: 'ReceiptNotClaimedExpiredTitle',
    descriptionI18nKey: 'YouAreNowAMember',
  },
  [NEW_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE]: {
    titleI18nKey: 'ReceiptClaimedSomeElseTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS],
  },
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT]: {
    titleI18nKey: 'ReceiptNotClaimedReachLimitTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE],
  },
  [NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT]: {
    titleI18nKey: 'ReceiptClaimedRepeatTitle',
    descriptionI18nKey: 'YouAreNowAMember',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS],
  },
  [NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT]: {
    titleI18nKey: 'ReceiptNotClaimedDefaultTitle',
    descriptionI18nKey: 'ReceiptNotClaimedDefaultDescription',
  },
  [NEW_MEMBER_TYPES.RECEIPT_BIND_CUSTOMER_FAILED]: {
    titleI18nKey: 'ReceiptBindCustomerFailedTitle',
    descriptionI18nKey: 'ReceiptNotClaimedDefaultDescription',
  },
};

export const RETURNING_MEMBER_TYPES = {
  DEFAULT: 'default',
  THANKS_COMING_BACK: 'thanksComingBack',
  ENABLED_POINTS: 'enabledPoints',
  REDEEM_CASHBACK: 'redeemCashback',
  EARNED_CASHBACK: 'earnedCashback',
  CLAIMED_REPEAT: 'claimedRepeat',
  CLAIMED_SOMEONE_ELSE: 'claimedSomeoneElse',
  NOT_CLAIMED_EXPIRED: 'notClaimedExpired',
  NOT_CLAIMED_REACH_LIMIT: 'notClaimedReachLimit',
  NOT_CLAIMED_CANCELLED: 'notClaimedCancelled',
  NOT_CLAIMED_REACH_MERCHANT_LIMIT: 'notClaimedReachMerchantLimit',
  NOT_CLAIMED_DEFAULT: 'notClaimedDefault',
  RECEIPT_EARNED_POINTS: 'receiptEarnedPoints',
  RECEIPT_EARNED_CASHBACK: 'receiptEarnedCashback',
  RECEIPT_EARNED_POINTS_CASHBACK: 'receiptEarnedPointsCashback',
  RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION: 'receiptNotClaimedCancelledNoTransaction',
  RECEIPT_NOT_CLAIMED_EXPIRED: 'receiptNotClaimedExpired',
  RECEIPT_CLAIMED_SOME_ELSE: 'receiptClaimedSomeElse',
  RECEIPT_NOT_CLAIMED_REACH_LIMIT: 'receiptNotClaimedReachLimit',
  RECEIPT_CLAIMED_REPEAT: 'receiptClaimedRepeat',
  RECEIPT_NOT_CLAIMED_DEFAULT: 'receiptNotClaimedDefault',
  RECEIPT_BIND_CUSTOMER_FAILED: 'receiptBindCustomerFailed',
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
  [RETURNING_MEMBER_TYPES.ENABLED_POINTS]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.EARNED_CASHBACK]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.CLAIMED_REPEAT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_CANCELLED]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_LIMIT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.NOT_CLAIMED_DEFAULT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK]: RewardsEarnedCashbackIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_POINTS]: RewardsEarnedPointsIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK]: [RewardsEarnedPointsIcon, RewardsEarnedCashbackIcon],
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE]: RewardsFailedIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT]: RewardsFailedIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT]: RewardsFailedIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT]: RewardsWarningIcon,
  [RETURNING_MEMBER_TYPES.RECEIPT_BIND_CUSTOMER_FAILED]: RewardsWarningIcon,
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
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: {
    titleI18nKey: 'RedeemCashbackReturningMemberMessage',
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
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_POINTS]: {
    titleI18nKey: 'ReceiptEarnedOnlyPointsTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK]: {
    titleI18nKey: 'ReceiptEarnedOnlyCashbackTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK]: {
    titleI18nKey: 'ReceiptEarnedPointsAndCashbackTitle',
    titleI18nParamsKeys: [
      MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE,
      MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE,
    ],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION]: {
    titleI18nKey: 'ReceiptNotClaimedCancelledNoTransactionTitle',
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED]: {
    titleI18nKey: 'ReceiptNotClaimedExpiredTitle',
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE]: {
    titleI18nKey: 'ReceiptClaimedSomeElseTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT]: {
    titleI18nKey: 'ReceiptNotClaimedReachLimitTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT]: {
    titleI18nKey: 'ReceiptClaimedRepeatTitle',
    titleI18nParamsKeys: [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS],
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT]: {
    titleI18nKey: 'ReceiptNotClaimedDefaultTitle',
    descriptionI18nKey: 'ReceiptNotClaimedDefaultDescription',
  },
  [RETURNING_MEMBER_TYPES.RECEIPT_BIND_CUSTOMER_FAILED]: {
    titleI18nKey: 'ReceiptBindCustomerFailedTitle',
    descriptionI18nKey: 'ReceiptNotClaimedDefaultDescription',
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
