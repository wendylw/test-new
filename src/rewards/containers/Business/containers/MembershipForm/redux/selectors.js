import _get from 'lodash/get';
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
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
  getHasUserJoinedMerchantMembership,
} from '../../../../../redux/modules/customer/selectors';
import { getIsRequestOrderRewardsEnabled, getIsClaimOrderRewardsCompleted } from '../../../redux/common/selectors';

export const getLoadOrderRewardsRequestData = state => state.business.membershipForm.loadOrderRewardsRequest.data;

export const getLoadOrderRewardsRequestStatus = state => state.business.membershipForm.loadOrderRewardsRequest.status;

export const getLoadOrderRewardsRequestError = state => state.business.membershipForm.loadOrderRewardsRequest.error;

export const getOrderRewardsPoints = createSelector(getLoadOrderRewardsRequestData, loadOrderRewardsRequestData =>
  _get(loadOrderRewardsRequestData, 'points.amount', 0)
);

export const getOrderRewardsCashback = createSelector(getLoadOrderRewardsRequestData, loadOrderRewardsRequestData =>
  _get(loadOrderRewardsRequestData, 'cashback.amount', 0)
);

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
  getHasUserJoinedMerchantMembership,
  (isUserProfileIncomplete, hasUserJoinedMerchantMembership) =>
    isUserProfileIncomplete && !hasUserJoinedMerchantMembership
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

export const getIsLoadOrderRewardsRequestFulfilled = createSelector(
  getLoadOrderRewardsRequestStatus,
  loadOrderRewardsRequestStatus => loadOrderRewardsRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsClaimedOrderRewardsEnabled = createSelector(
  getIsRequestOrderRewardsEnabled,
  getIsLoadOrderRewardsRequestFulfilled,
  (isRequestOrderRewardsEnabled, isLoadOrderRewardsRequestFulfilled) =>
    isRequestOrderRewardsEnabled && isLoadOrderRewardsRequestFulfilled
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

// This request needs to be placed before the return of hasUserJoinedMerchantMembership;
// customer has already joined the membership, still complete claim order rewards according to the current design.
export const getShouldClaimOrderRewards = createSelector(
  getHasUserJoinedMerchantMembership,
  getIsClaimedOrderRewardsEnabled,
  (hasUserJoinedMerchantMembership, isClaimedOrderRewardsEnabled) =>
    hasUserJoinedMerchantMembership && isClaimedOrderRewardsEnabled
);

export const getShouldGoToMembershipDetail = createSelector(
  getHasUserJoinedMerchantMembership,
  getIsClaimedOrderRewardsEnabled,
  getIsClaimOrderRewardsCompleted,
  (hasUserJoinedMerchantMembership, isClaimedOrderRewardsEnabled, isClaimOrderRewardsCompleted) => {
    if (isClaimedOrderRewardsEnabled) {
      return hasUserJoinedMerchantMembership && isClaimOrderRewardsCompleted;
    }

    return hasUserJoinedMerchantMembership;
  }
);
