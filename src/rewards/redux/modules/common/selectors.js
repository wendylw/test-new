import i18next from 'i18next';
import { createSelector } from 'reselect';
import { FEATURE_KEYS } from '../../../../redux/modules/growthbook/constants';
import {
  getQueryString,
  isWebview,
  isTNGMiniProgram,
  isGCashMiniProgram,
  toCapitalize,
} from '../../../../common/utils';
import { BECOME_MERCHANT_MEMBER_METHODS, MEMBER_LEVELS, PATH_NAME_MAPPING } from '../../../../common/utils/constants';
import { isAlipayMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';
import { getFeatureFlagResult } from '../../../../redux/modules/growthbook/selectors';
import { getIsLogin } from '../../../../redux/modules/user/selectors';
import { getCustomerTierLevel } from '../customer/selectors';
import { getMembershipTierList } from '../../../../redux/modules/membership/selectors';

/** Utils */
export const getIsWebview = () => isWebview();

export const getIsTNGMiniProgram = () => isTNGMiniProgram();

export const getIsGCashMiniProgram = () => isGCashMiniProgram();

export const getIsAlipayMiniProgram = () => isAlipayMiniProgram();

export const getIsWeb = () => !isWebview() && !isAlipayMiniProgram();

export const getBusiness = () => getQueryString('business');

export const getQuerySource = () => getQueryString('source');

export const getIsNotLoginInWeb = createSelector(getIsLogin, getIsWeb, (isLogin, isWeb) => !isLogin && isWeb);

export const getSource = state => state.common.source;

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationPathname = state => state.router.location.pathname;

/**
 * Derived selectors
 */

// TODO: change name to query
export const getIsFromJoinMembershipUrlClick = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK
);

// TODO: change name to query
export const getIsFromReceiptJoinMembershipUrlQRScan = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.RECEIPT_JOIN_MEMBERSHIP_URL_QR_SCAN
);

// TODO: change name to query
export const getIsFromReceiptMembershipDetailQRScan = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.RECEIPT_MEMBERSHIP_DETAIL_QR_SCAN
);

// TODO: change name to query
export const getIsFromEarnedCashbackQRScan = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

// TODO: change name to query
export const getIsFromSeamlessLoyaltyQrScan = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

// TODO: change name to query
export const getIsFromThankYouCashbackClick = createSelector(
  getQuerySource,
  querySource => querySource === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

export const getLocationSearch = createSelector(getLocation, location => location.search);

export const getIsMembershipBenefitTabsShown = createSelector(
  getMembershipTierList,
  membershipTierList => membershipTierList.length > 1
);

export const getMembershipTiersBenefit = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.SHOW_TIERED_MEMBERSHIP_BENEFIT);

export const getMerchantMembershipTiersBenefit = createSelector(
  getMembershipTiersBenefit,
  getMembershipTierList,
  (membershipTiersBenefit, membershipTierList) => {
    if (membershipTiersBenefit.length === 0) {
      return [];
    }

    return membershipTierList.map(tier => {
      const { level } = tier;
      const currentBenefit = membershipTiersBenefit.find(benefit => benefit.level === level);

      return {
        ...tier,
        ...currentBenefit,
      };
    });
  }
);

export const getMerchantMembershipTiersBenefitLength = createSelector(
  getMerchantMembershipTiersBenefit,
  membershipTiersBenefit => membershipTiersBenefit.length
);

export const getIsMembershipBenefitsShown = createSelector(
  getMembershipTierList,
  membershipTierList => membershipTierList.length > 0
);

export const getIsJoinMembershipPathname = createSelector(
  getLocationPathname,
  locationPathName =>
    locationPathName ===
    `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.SIGN_UP}`
);

export const getMerchantMembershipTiersBenefits = createSelector(
  getIsJoinMembershipPathname,
  getCustomerTierLevel,
  getMembershipTierList,
  (isJoinMembershipPathname, customerTierLevel, membershipTierList) => {
    if (membershipTierList.length === 0) {
      return [];
    }

    return membershipTierList.map(({ id, level, name, benefits = [] }) => {
      const isLocked = level > (isJoinMembershipPathname ? MEMBER_LEVELS.MEMBER : customerTierLevel);
      let prompt = null;

      if (isJoinMembershipPathname) {
        if (membershipTierList.length > 1) {
          prompt =
            level === MEMBER_LEVELS.MEMBER
              ? i18next.t('Rewards:UnlockLevelPrompt')
              : i18next.t('Rewards:UnlockHigherLevelPrompt', { levelName: toCapitalize(name) });
        } else {
          prompt = i18next.t('Rewards:UnlockOneTierLevelPrompt');
        }
      }

      return {
        key: `membership-tier-benefit-${id}`,
        isLocked,
        prompt,
        name,
        level,
        conditions: benefits,
      };
    });
  }
);

export const getMerchantMembershipTiersBenefitsLength = createSelector(
  getMerchantMembershipTiersBenefits,
  merchantMembershipTiersBenefits => merchantMembershipTiersBenefits.length
);
