import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { CUSTOMER_NOT_FOUND_ERROR_CODE } from '../constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import { getIsLogin, getIsCheckLoginRequestCompleted } from '../../../../../../redux/modules/user/selectors';
import {
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
  getHasUserJoinedBusinessMembership,
} from '../../../../../redux/modules/customer/selectors';
import {
  getIsBusinessMembershipEnabled,
  getIsBusinessInfoRequestStatusFulfilled,
  getIsBusinessInfoRequestStatusRejected,
  getIsBusinessInfoRequestStatusCompleted,
} from '../../../redux/common/selectors';

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
  getIsBusinessInfoRequestStatusCompleted,
  isBusinessInfoRequestStatusCompleted => !isBusinessInfoRequestStatusCompleted
);

export const getShouldShowUnsupportedError = createSelector(
  getIsBusinessInfoRequestStatusFulfilled,
  getIsBusinessMembershipEnabled,
  (isBusinessInfoRequestStatusFulfilled, isBusinessMembershipEnabled) =>
    isBusinessInfoRequestStatusFulfilled && !isBusinessMembershipEnabled
);

export const getShouldShowUnknownError = createSelector(
  getIsLogin,
  getIsCustomerNotFoundError,
  getIsBusinessInfoRequestStatusRejected,
  getIsLoadCustomerRequestStatusRejected,
  (isLogin, isCustomerNotFoundError, isBusinessInfoRequestStatusRejected, isLoadCustomerRequestStatusRejected) => {
    if (isBusinessInfoRequestStatusRejected) {
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
  getHasUserJoinedBusinessMembership,
  getIsLoadCustomerRequestStatusCompleted,
  (isLogin, isCheckLoginRequestCompleted, hasUserJoinedBusinessMembership, isLoadCustomerRequestStatusCompleted) => {
    if (!isCheckLoginRequestCompleted) {
      return false;
    }

    if (!isLogin) {
      return true;
    }

    return isLoadCustomerRequestStatusCompleted && !hasUserJoinedBusinessMembership;
  }
);

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);

export const getIsJoinNowButtonDisabled = state => state.business.membershipForm.isJoinNowButtonDisabled;
