import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { CUSTOMER_NOT_FOUND_ERROR_CODE } from '../constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import { getIsLogin, getIsCheckLoginRequestCompleted } from '../../../../../../redux/modules/user/selectors';
import {
  getIsMerchantEnabledMembership,
  getIsLoadMerchantRequestStatusFulfilled,
  getIsLoadMerchantRequestStatusRejected,
  getIsLoadMerchantRequestCompleted,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
  getHasUserJoinedMerchantMembership,
} from '../../../../../redux/modules/customer/selectors';

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

export const getShouldShowSkeletonLoader = createSelector(
  getIsLoadMerchantRequestCompleted,
  isLoadMerchantRequestCompleted => !isLoadMerchantRequestCompleted
);

export const getShouldShowUnsupportedError = createSelector(
  getIsLoadMerchantRequestStatusFulfilled,
  getIsMerchantEnabledMembership,
  (isLoadMerchantRequestStatusFulfilled, isMerchantEnabledMembership) =>
    isLoadMerchantRequestStatusFulfilled && !isMerchantEnabledMembership
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

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);

export const getIsJoinNowButtonDisabled = state => state.business.membershipForm.isJoinNowButtonDisabled;
