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

export const getSource = () => getQueryString('source');

export const getBusiness = () => getQueryString('business');

export const getIsNotLoginInWeb = createSelector(getIsLogin, getIsWeb, (isLogin, isWeb) => !isLogin && isWeb);

/** Router */
export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationPathname = state => state.router.location.pathname;

/**
 * Derived selectors
 */

export const getIsFromJoinMembershipUrlClick = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK
);

export const getIsFromReceiptJoinMembershipUrlQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.RECEIPT_JOIN_MEMBERSHIP_URL_QR_SCAN
);

export const getIsFromReceiptMembershipDetailQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.RECEIPT_MEMBERSHIP_DETAIL_QR_SCAN
);

export const getLocationSearch = createSelector(getLocation, location => location.search);

export const getIsMembershipBenefitTabsShown = createSelector(
  getMembershipTierList,
  membershipTierList => membershipTierList.length > 1
);

export const getMembershipTiersBenefit = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.SHOW_TIERED_MEMBERSHIP_BENEFIT);

export const getIsMembershipBenefitInfoShown = createSelector(
  getMembershipTiersBenefit,
  getMembershipTierList,
  (membershipTiersBenefit, membershipTierList) => membershipTiersBenefit.length > 0 && membershipTierList.length > 0
);

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

export const getNewTierBenefitRedesign = state => getFeatureFlagResult(state, FEATURE_KEYS.NEW_TIER_BENEFIT_REDESIGN);

export const getIsMembershipBenefitsShown = createSelector(
  getNewTierBenefitRedesign,
  getMembershipTierList,
  (newTierBenefitRedesign, membershipTierList) => newTierBenefitRedesign.length > 0 && membershipTierList.length > 0
);

export const getMerchantMembershipTiersBenefits = createSelector(
  getLocationPathname,
  getCustomerTierLevel,
  getNewTierBenefitRedesign,
  getMembershipTierList,
  (locationPathName, customerTierLevel, newTierBenefitRedesign, membershipTierList) => {
    if (newTierBenefitRedesign.length === 0) {
      return [];
    }

    const isJoinMembershipPathname =
      locationPathName ===
      `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.SIGN_UP}`;

    return newTierBenefitRedesign.map(benefit => {
      const { level } = benefit;
      const isLocked = benefit.level > (isJoinMembershipPathname ? MEMBER_LEVELS.MEMBER : customerTierLevel);
      const currentTier = membershipTierList.find(tier => tier.level === level) || {};
      let prompt = null;

      if (isJoinMembershipPathname) {
        if (membershipTierList.length > 1) {
          prompt =
            benefit.level === MEMBER_LEVELS.MEMBER
              ? i18next.t('Rewards:UnlockLevelPrompt')
              : i18next.t('Rewards:UnlockHigherLevelPrompt', { levelName: toCapitalize(currentTier.name) });
        } else {
          prompt = i18next.t('Rewards:UnlockOneTierLevelPrompt');
        }
      }

      return {
        ...benefit,
        ...currentTier,
        key: `membership-tier-benefit-${level}`,
        isLocked,
        prompt,
      };
    });
  }
);

export const getMerchantMembershipTiersBenefitsLength = createSelector(
  getMerchantMembershipTiersBenefits,
  merchantMembershipTiersBenefits => merchantMembershipTiersBenefits.length
);
