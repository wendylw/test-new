import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { CUSTOMER_NOT_FOUND_ERROR_CODE } from '../constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import { getIsLogin, getIsCheckLoginRequestCompleted } from '../../../../../../redux/modules/user/selectors';

export const getBusinessInfoRequest = state => state.business.membershipForm.fetchBusinessInfoRequest;

export const getBusinessInfo = createSelector(getBusinessInfoRequest, businessInfoRequest => businessInfoRequest.data);

export const getBusinessLogo = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'businessLogo', ''));

export const getBusinessName = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'businessName', ''));

export const getIsBusinessMembershipEnabled = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'membershipEnabled', false)
);

export const getBusinessInfoRequestStatus = createSelector(
  getBusinessInfoRequest,
  businessInfoRequest => businessInfoRequest.status
);

export const getIsBusinessInfoRequestStatusFulfilled = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus => businessInfoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsBusinessInfoRequestStatusRejected = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus => businessInfoRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsBusinessInfoRequestStatusCompleted = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(businessInfoRequestStatus)
);

export const getConsumerCustomerBusinessInfoRequest = state =>
  state.business.membershipForm.fetchConsumerCustomerBusinessInfoRequest;

export const getConsumerCustomerBusinessInfo = createSelector(
  getConsumerCustomerBusinessInfoRequest,
  consumerCustomerBusinessInfoRequest => consumerCustomerBusinessInfoRequest.data
);

export const getHasUserJoinedBusinessMembership = createSelector(
  getConsumerCustomerBusinessInfo,
  consumerCustomerBusinessInfo => !!_get(consumerCustomerBusinessInfo, 'customerTier', null)
);

export const getConsumerCustomerBusinessInfoRequestStatus = createSelector(
  getConsumerCustomerBusinessInfoRequest,
  consumerCustomerBusinessInfoRequest => consumerCustomerBusinessInfoRequest.status
);

export const getIsConsumerCustomerBusinessInfoRequestStatusRejected = createSelector(
  getConsumerCustomerBusinessInfoRequestStatus,
  consumerCustomerBusinessInfoRequest => consumerCustomerBusinessInfoRequest === API_REQUEST_STATUS.REJECTED
);

export const getIsConsumerCustomerBusinessInfoRequestStatusCompleted = createSelector(
  getConsumerCustomerBusinessInfoRequestStatus,
  consumerCustomerBusinessInfoRequest =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(consumerCustomerBusinessInfoRequest)
);

export const getConsumerCustomerBusinessInfoRequestError = createSelector(
  getConsumerCustomerBusinessInfoRequest,
  consumerCustomerBusinessInfoRequest => consumerCustomerBusinessInfoRequest.error
);

export const getIsCustomerNotFoundError = createSelector(
  getConsumerCustomerBusinessInfoRequestError,
  consumerCustomerBusinessInfoRequestError =>
    consumerCustomerBusinessInfoRequestError?.code === CUSTOMER_NOT_FOUND_ERROR_CODE
);

export const getBusinessRewardsUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).introURL;

export const getCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).congratsURL;

export const getShouldShowSkeletonLoader = createSelector(
  getIsLogin,
  getIsCheckLoginRequestCompleted,
  getIsBusinessInfoRequestStatusCompleted,
  getIsConsumerCustomerBusinessInfoRequestStatusCompleted,
  (
    isLogin,
    isCheckLoginRequestCompleted,
    isBusinessInfoRequestStatusCompleted,
    isConsumerCustomerBusinessInfoRequestStatusCompleted
  ) => {
    if (isLogin) {
      return !(
        isCheckLoginRequestCompleted &&
        isBusinessInfoRequestStatusCompleted &&
        isConsumerCustomerBusinessInfoRequestStatusCompleted
      );
    }

    return !(isCheckLoginRequestCompleted && isBusinessInfoRequestStatusCompleted);
  }
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
  getIsConsumerCustomerBusinessInfoRequestStatusRejected,
  (
    isLogin,
    isCustomerNotFoundError,
    isBusinessInfoRequestStatusRejected,
    isConsumerCustomerBusinessInfoRequestStatusRejected
  ) => {
    if (isBusinessInfoRequestStatusRejected) {
      return true;
    }

    if (isLogin) {
      // NOTE: customer could login from other business so we need to consider this special case.
      return isConsumerCustomerBusinessInfoRequestStatusRejected && !isCustomerNotFoundError;
    }

    return false;
  }
);

export const getJoinMembershipRequest = state => state.business.membershipForm.joinMembershipRequest;

export const getJoinMembershipRequestStatus = createSelector(
  getJoinMembershipRequest,
  joinMembershipRequest => joinMembershipRequest.status
);

export const getIsJoinMembershipRequestStatusFulfilled = createSelector(
  getJoinMembershipRequestStatus,
  joinMembershipRequestStatus => joinMembershipRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getShouldShowCongratulation = createSelector(
  getHasUserJoinedBusinessMembership,
  getIsJoinMembershipRequestStatusFulfilled,
  (hasJoinedMembership, isJoinMembershipRequestStatusFulfilled) =>
    hasJoinedMembership || isJoinMembershipRequestStatusFulfilled
);

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);

export const getIsJoinNowButtonDisabled = state => state.business.membershipForm.isJoinNowButtonDisabled;
