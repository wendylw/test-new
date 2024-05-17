import i18next from 'i18next';
import { createSelector } from 'reselect';
import { FEATURE_KEYS } from '../../../../redux/modules/growthbook/constants';
import { getQueryString, isWebview, isTNGMiniProgram, isGCashMiniProgram } from '../../../../common/utils';
import { BECOME_MERCHANT_MEMBER_METHODS, MEMBER_LEVELS } from '../../../../common/utils/constants';
import { isAlipayMiniProgram } from '../../../../common/utils/alipay-miniprogram-client';
import { getFeatureFlagResult } from '../../../../redux/modules/growthbook/selectors';
import { getIsLogin } from '../../../../redux/modules/user/selectors';
import { getCustomerTierLevel } from '../customer/selectors';
import { getMembershipTierList } from '../../../../redux/modules/membership/selectors';

// If description change from Back End. We will remove it
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#36A93F" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>`;
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#717171" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path></svg>`;

// If description change from Back End. We will remove it
const insertSvgStringToItem = (description, startTag, svgString) => {
  const regex = new RegExp(`(${startTag})`, 'g');

  return description.replace(regex, `$1${svgString}`);
};

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
  getSource,
  getCustomerTierLevel,
  getMembershipTiersBenefit,
  getMembershipTierList,
  (source, customerTierLevel, membershipTiersBenefit, membershipTierList) => {
    if (membershipTiersBenefit.length === 0) {
      return [];
    }
    const isFromJoinMembership = [BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK].includes(source);

    return membershipTierList.map(tier => {
      const { level } = tier;
      const isLocked = tier.level > (isFromJoinMembership ? MEMBER_LEVELS.MEMBER : customerTierLevel);
      const currentBenefit = membershipTiersBenefit.find(benefit => benefit.level === level);
      const displayDescription = isLocked
        ? insertSvgStringToItem(currentBenefit.description, `<li>`, LOCK_SVG)
        : insertSvgStringToItem(currentBenefit.description, `<li>`, CHECK_SVG);
      let prompt = null;

      if (isFromJoinMembership) {
        prompt =
          tier.level === MEMBER_LEVELS.MEMBER
            ? i18next.t('Rewards:UnlockLevelPrompt')
            : i18next.t('Rewards:UnlockHigherLevelPrompt', { levelName: currentBenefit.name });
      }

      return {
        ...tier,
        ...currentBenefit,
        isLocked,
        displayDescription,
        prompt,
      };
    });
  }
);

export const getMerchantMembershipTiersBenefitLength = createSelector(
  getMerchantMembershipTiersBenefit,
  membershipTiersBenefit => membershipTiersBenefit.length
);
