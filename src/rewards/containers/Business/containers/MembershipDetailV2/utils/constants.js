import MembershipLevelIcon from '../../../../../../images/membership-level.svg';

export const MEMBER_TYPE_I18N_PARAM_KEYS = {
  CASHBACK_VALUE: 'cashbackValue',
};

export const NEW_MEMBER_TYPES = {
  DEFAULT: 'default',
};

export const NEW_MEMBER_ICONS = {
  [NEW_MEMBER_TYPES.DEFAULT]: MembershipLevelIcon,
};

export const NEW_MEMBER_I18N_KEYS = {
  [NEW_MEMBER_TYPES.DEFAULT]: {
    titleI18nKey: 'DefaultNewMemberTitle',
    descriptionI18nKey: 'DefaultNewMemberDescription',
  },
};

export const RETURNING_MEMBER_TYPES = {
  DEFAULT: 'default',
  THANKS_COMING_BACK: 'thanksComingBack',
};

export const RETURNING_MEMBER_ICONS = {};

export const RETURNING_MEMBER_I18N_KEYS = {
  [RETURNING_MEMBER_TYPES.DEFAULT]: {
    titleI18nKey: 'DefaultReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.THANKS_COMING_BACK]: {
    titleI18nKey: 'ThanksComingBackReturningMemberTitle',
    descriptionI18nKey: 'ThanksComingBackReturningMemberDescription',
  },
};

export const MEMBERSHIP_TIER_I18N_PARAM_KEYS = {
  TOTAL_SPEND_PRICE: 'totalSpendPrice',
  NEXT_TIER_SPENDING_THRESHOLD_PRICE: 'nextTierSpendingThresholdPrice',
  MAINTAIN_SPEND_PRICE: 'maintainSpendPrice',
  NEXT_REVIEW_DATE: 'nextReviewDate',
  NEXT_TIER_NAME: 'nextTierName',
  CURRENT_TIER_NAME: 'currentTierName',
};

export const MEMBERSHIP_TIER_STATUS = {
  UNLOCK_NEXT_TIER: 'unlockNextTier',
  TIER_COMPLETED: 'tierCompleted',
  TIER_MAINTAIN: 'tierMaintain',
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
  [MEMBERSHIP_TIER_STATUS.TIER_COMPLETED]: {
    messageI18nKey: 'TiersCompletedMessage',
    messageI18nParamsKeys: [
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME,
      MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE,
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
};