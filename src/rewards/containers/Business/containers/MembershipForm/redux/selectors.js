import { createSelector } from 'reselect';
import i18next from 'i18next';
import RewardsPointsWhiteIcon from '../../../../../../images/rewards-points-icon-white.svg';
import RewardsCashbackWhiteIcon from '../../../../../../images/rewards-cashback-icon-white.svg';
import RewardsStoreCreditsWhiteIcon from '../../../../../../images/rewards-store-credits-icon-white.svg';
import RewardsDiscountWhiteIcon from '../../../../../../images/rewards-discount-icon-white.svg';
import RewardsVouchersWhiteIcon from '../../../../../../images/rewards-vouchers-icon-white.svg';
import { API_REQUEST_STATUS, BECOME_MERCHANT_MEMBER_METHODS } from '../../../../../../common/utils/constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getPrice } from '../../../../../../common/utils';
import { CUSTOMER_NOT_FOUND_ERROR_CODE, REWARDS_NAMES, GET_REWARDS_ESTIMATION_ERROR_CODES } from '../constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import {
  getIsLogin,
  getIsCheckLoginRequestCompleted,
  getIsUserProfileIncomplete,
} from '../../../../../../redux/modules/user/selectors';
import {
  getIsMerchantMembershipEnabled,
  getIsLoadMerchantRequestStatusFulfilled,
  getIsLoadMerchantRequestStatusRejected,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantEnabledStoreCredits,
  getIsMerchantEnabledCashback,
  getIsMerchantMembershipPointsEnabled,
  getMerchantCountry,
  getMerchantLocale,
  getMerchantCurrency,
} from '../../../../../../redux/modules/merchant/selectors';
import { getIsWebview, getSource } from '../../../../../redux/modules/common/selectors';
import {
  getLoadOrderRewardsRequestError,
  getOrderRewardsPoints,
  getOrderRewardsCashback,
} from '../../../redux/common/selectors';
import {
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
  getHasUserJoinedMerchantMembership,
} from '../../../../../redux/modules/customer/selectors';

/**
 * Derived selectors
 */
export const getIsLoadCustomerRequestStatusRejected = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus => loadCustomerRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsLoadCustomerRequestStatusCompleted = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadCustomerRequestStatus)
);

export const getIsCustomerNotFoundError = createSelector(
  getLoadCustomerRequestError,
  loadCustomerRequestError => loadCustomerRequestError?.code === CUSTOMER_NOT_FOUND_ERROR_CODE
);

export const getIsJoinMembershipNewDesign = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.JOIN_MEMBERSHIP_NEW_DESIGN);

export const getShouldShowSkeletonLoader = createSelector(
  getIsLoadMerchantRequestCompleted,
  isLoadMerchantRequestCompleted => !isLoadMerchantRequestCompleted
);

export const getShouldShowUnsupportedError = createSelector(
  getIsLoadMerchantRequestStatusFulfilled,
  getIsMerchantMembershipEnabled,
  (isLoadMerchantRequestStatusFulfilled, isMerchantMembershipEnabled) =>
    isLoadMerchantRequestStatusFulfilled && !isMerchantMembershipEnabled
);

export const getShouldShowUnknownError = createSelector(
  getIsLogin,
  getIsCustomerNotFoundError,
  getIsLoadMerchantRequestStatusRejected,
  getIsLoadCustomerRequestStatusRejected,
  (isLogin, isCustomerNotFoundError, isLoadMerchantRequestStatusRejected, isLoadCustomerRequestStatusRejected) => {
    if (isLoadMerchantRequestStatusRejected) {
      return true;
    }

    if (isLogin) {
      // NOTE: customer could login from other business so we need to consider this special case.
      return isLoadCustomerRequestStatusRejected && !isCustomerNotFoundError;
    }

    return false;
  }
);

export const getShouldShowFooter = createSelector(
  getIsLogin,
  getIsCheckLoginRequestCompleted,
  getHasUserJoinedMerchantMembership,
  getIsLoadCustomerRequestStatusCompleted,
  (isLogin, isCheckLoginRequestCompleted, hasUserJoinedMerchantMembership, isLoadCustomerRequestStatusCompleted) => {
    if (!isCheckLoginRequestCompleted) {
      return false;
    }

    if (!isLogin) {
      return true;
    }

    return isLoadCustomerRequestStatusCompleted && !hasUserJoinedMerchantMembership;
  }
);

export const getIsUserFromOrdering = createSelector(getSource, source =>
  [BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK].includes(source)
);

export const getShouldShowBackButton = createSelector(
  getIsWebview,
  getIsUserFromOrdering,
  (isInWebview, isUserFromOrdering) => isInWebview || isUserFromOrdering
);

export const getIsJoinNowButtonDisabled = state => state.business.membershipForm.isJoinNowButtonDisabled;

// WB-7279: fix iOS swipe back no response issue.
export const getShouldDisableJoinNowButton = createSelector(
  getIsWebview,
  getIsJoinNowButtonDisabled,
  (isWebview, isJoinNowButtonDisabled) => !isWebview && isJoinNowButtonDisabled
);

export const getIsProfileFormVisible = state => state.business.membershipForm.isProfileFormVisible;

export const getShouldShowProfileForm = createSelector(
  getIsUserProfileIncomplete,
  isUserProfileIncomplete => isUserProfileIncomplete
);

export const getJoinMembershipRewardList = createSelector(
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledStoreCredits,
  getIsMerchantMembershipPointsEnabled,
  (isMerchantEnabledCashback, isMerchantEnabledStoreCredits, isMerchantMembershipPointsEnabled) => {
    const rewards = [
      {
        key: 'discounts',
        icon: RewardsDiscountWhiteIcon,
        text: i18next.t('Rewards:Discounts'),
      },
      {
        key: 'vouchers',
        icon: RewardsVouchersWhiteIcon,
        text: i18next.t('Rewards:Vouchers'),
      },
    ];

    if (isMerchantEnabledCashback) {
      rewards.unshift({
        key: 'cashback',
        icon: RewardsCashbackWhiteIcon,
        text: i18next.t('Common:Cashback'),
      });
    } else if (isMerchantEnabledStoreCredits) {
      rewards.unshift({
        key: 'storeCredits',
        icon: RewardsStoreCreditsWhiteIcon,
        text: i18next.t('Rewards:StoreCredits'),
      });
    }

    if (isMerchantMembershipPointsEnabled) {
      rewards.unshift({
        key: 'points',
        icon: RewardsPointsWhiteIcon,
        text: i18next.t('Rewards:Points'),
      });
    }

    return rewards;
  }
);

export const getOrderRewardsCashbackPrice = createSelector(
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  getOrderRewardsCashback,
  (merchantCountry, merchantCurrency, merchantLocale, orderRewardsCashback) =>
    getPrice(orderRewardsCashback, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry })
);

export const getOrderRewards = createSelector(
  getOrderRewardsPoints,
  getOrderRewardsCashback,
  getOrderRewardsCashbackPrice,
  (orderRewardsPoints, orderRewardsCashback, orderRewardsCashbackPrice) => {
    const rewards = [];

    if (orderRewardsPoints) {
      rewards.push({
        key: REWARDS_NAMES.POINTS,
        value: orderRewardsPoints,
      });
    }

    if (orderRewardsCashback) {
      rewards.push({
        key: REWARDS_NAMES.CASHBACK,
        value: orderRewardsCashbackPrice,
      });
    }

    return rewards;
  }
);

export const getIsLoadOrderRewardsNoTransaction = createSelector(
  getLoadOrderRewardsRequestError,
  loadOrderRewardsRequestError => {
    if (!loadOrderRewardsRequestError) {
      return null;
    }

    const { code } = loadOrderRewardsRequestError || {};

    return code === GET_REWARDS_ESTIMATION_ERROR_CODES.NO_TRANSACTION;
  }
);

export const getLoadOrderRewardsError = createSelector(
  getLoadOrderRewardsRequestError,
  loadOrderRewardsRequestError => {
    if (!loadOrderRewardsRequestError) {
      return null;
    }

    const { code } = loadOrderRewardsRequestError || {};
    const error = {};

    switch (code) {
      case GET_REWARDS_ESTIMATION_ERROR_CODES.EXPIRED:
        error.title = i18next.t('Rewards:ErrorGetRewardsExpiredTitle');
        error.description = null;
        break;
      case GET_REWARDS_ESTIMATION_ERROR_CODES.ORDER_CANCELED_REFUND:
        error.title = i18next.t('Rewards:ErrorGetRewardsCanceledRefundTitle');
        error.description = null;
        break;
      default:
        error.title = i18next.t('Common:SomethingWentWrongTitle');
        error.description = i18next.t('Common:SomethingWentWrongDescription');
        break;
    }

    return error;
  }
);
