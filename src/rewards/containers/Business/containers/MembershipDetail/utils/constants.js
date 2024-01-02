import MembershipLevelIcon from '../../../../../../images/membership-level.svg';
import RewardsEarnedCashbackIcon from '../../../../../../images/rewards-earned-cashback.svg';

export const NEW_MEMBER_TYPES = {
  DEFAULT: 'default',
  REDEEM_CASHBACK: 'redeemCashback',
};

export const RETURNING_MEMBER_TYPES = {
  DEFAULT: 'default',
  REDEEM_CASHBACK: 'redeemCashback',
  THANKS_COMING_BACK: 'thanksComingBack',
};

export const NEW_MEMBER_ICONS = {
  [NEW_MEMBER_TYPES.DEFAULT]: MembershipLevelIcon,
  [NEW_MEMBER_TYPES.REDEEM_CASHBACK]: RewardsEarnedCashbackIcon,
};

export const NEW_MEMBER_I18N_KEYS = {
  [NEW_MEMBER_TYPES.DEFAULT]: {
    titleI18Key: 'DefaultNewMemberTitle',
    descriptionI18Key: 'DefaultNewMemberDescription',
  },
  [NEW_MEMBER_TYPES.REDEEM_CASHBACK]: {
    titleI18Key: 'RedeemCashbackNewMemberTitle',
    descriptionI18Key: 'RedeemCashbackNewMemberDescription',
  },
};

export const RETURNING_MEMBER_ICONS = {
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: RewardsEarnedCashbackIcon,
};

export const RETURNING_MEMBER_I18N_KEYS = {
  [RETURNING_MEMBER_TYPES.DEFAULT]: {
    titleI18Key: 'DefaultReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.REDEEM_CASHBACK]: {
    titleI18Key: 'RedeemCashbackReturningMemberMessage',
  },
  [RETURNING_MEMBER_TYPES.THANKS_COMING_BACK]: {
    titleI18Key: 'ThanksComingBackReturningMemberTitle',
    descriptionI18Key: 'ThanksComingBackReturningMemberDescription',
  },
};
