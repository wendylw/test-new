import RewardsEarnedCashbackIcon from '../../../../../../images/rewards-earned-cashback.svg';
import RewardsWarningIcon from '../../../../../../images/rewards-warning.svg';
import { CLAIMED_CASHBACK_STATUS } from '../../../utils/constants';

export const I18N_PARAM_KEYS = {
  CASHBACK_VALUE: 'cashbackValue',
};

export const CLAIMED_CASHBACK_ICONS = {
  [CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME]: RewardsEarnedCashbackIcon,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME]: RewardsEarnedCashbackIcon,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_PROCESSING]: RewardsEarnedCashbackIcon,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_EXPIRED]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_CANCELLED]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_NO_TRANSACTION]: RewardsWarningIcon,
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: RewardsWarningIcon,
};

export const CLAIMED_CASHBACK_I18N_KEYS = {
  [CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME]: {
    titleI18nKey: 'EarnedCashbackTitle',
    descriptionI18nKey: 'EarnedCashbackDescription',
    titleI18nParamsKeys: [I18N_PARAM_KEYS.CASHBACK_VALUE],
  },
  [CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME]: {
    titleI18nKey: 'EarnedCashbackTitle',
    descriptionI18nKey: 'EarnedCashbackDescription',
    titleI18nParamsKeys: [I18N_PARAM_KEYS.CASHBACK_VALUE],
  },
  [CLAIMED_CASHBACK_STATUS.CLAIMED_PROCESSING]: {
    titleI18nKey: 'ClaimedProcessingMessage',
    titleI18nParamsKeys: [I18N_PARAM_KEYS.CASHBACK_VALUE],
  },
  [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: {
    titleI18nKey: 'ClaimedRepeatMessage',
  },
  [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: {
    titleI18nKey: 'ClaimedSomeoneElseMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_EXPIRED]: {
    titleI18nKey: 'NotClaimedExpiredMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_CANCELLED]: {
    titleI18nKey: 'NotClaimedCancelledMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: {
    titleI18nKey: 'NotClaimedReachLimitMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: {
    titleI18nKey: 'NotClaimedReachMerchantLimitMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_NO_TRANSACTION]: {
    titleI18nKey: 'NotClaimedMessage',
  },
  [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: {
    titleI18nKey: 'NotClaimedMessage',
  },
};
