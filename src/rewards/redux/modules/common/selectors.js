import { createSelector } from 'reselect';
import { FEATURE_KEYS } from '../../../../redux/modules/growthbook/constants';
import { getQueryString, isWebview, isTNGMiniProgram, isGCashMiniProgram } from '../../../../common/utils';
import { isAlipayMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';
import { getFeatureFlagResult } from '../../../../redux/modules/growthbook/selectors';
import { getIsLogin } from '../../../../redux/modules/user/selectors';
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

      console.log({
        ...tier,
        ...currentBenefit,
      });

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
