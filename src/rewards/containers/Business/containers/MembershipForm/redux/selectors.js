import { createSelector } from 'reselect';
import { API_REQUEST_STATUS, BECOME_MERCHANT_MEMBER_METHODS } from '../../../../../../common/utils/constants';
import { CUSTOMER_NOT_FOUND_ERROR_CODE } from '../constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getQueryString } from '../../../../../../common/utils';
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
} from '../../../../../../redux/modules/merchant/selectors';
import { getIsWeb, getIsWebview, getSource } from '../../../../../redux/modules/common/selectors';
import {
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
  getHasUserJoinedMerchantMembership,
} from '../../../../../redux/modules/customer/selectors';

export const getStoreId = () => getQueryString('storeId');

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

export const getBusinessRewardsUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).introURL;

export const getCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).congratsURL;

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

export const getShouldHideHeader = createSelector(
  getIsJoinMembershipNewDesign,
  getIsWeb,
  (isJoinMembershipNewDesign, isWeb) => isJoinMembershipNewDesign && isWeb
);
