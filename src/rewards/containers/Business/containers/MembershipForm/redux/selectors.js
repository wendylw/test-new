import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { CUSTOMER_NOT_FOUND_ERROR_CODE } from '../constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import { getIsLogin, getIsCheckLoginRequestCompleted } from '../../../../../../redux/modules/user/selectors';
import {
  getCustomerData,
  getLoadCustomerRequestStatus,
  getLoadCustomerRequestError,
} from '../../../../../redux/modules/customer/selectors';

export const getBusinessInfoRequest = state => state.business.membershipForm.fetchBusinessInfoRequest;

export const getBusinessInfo = createSelector(getBusinessInfoRequest, businessInfoRequest => businessInfoRequest.data);

export const getBusinessLogo = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'logo', ''));

export const getBusinessName = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'displayName', ''));

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

export const getHasUserJoinedBusinessMembership = createSelector(
  getCustomerData,
  customerData => !!_get(customerData, 'customerTier', null)
);

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
  getIsLogin,
  getIsCheckLoginRequestCompleted,
  getIsBusinessInfoRequestStatusCompleted,
  getIsLoadCustomerRequestStatusCompleted,
  (
    isLogin,
    isCheckLoginRequestCompleted,
    isBusinessInfoRequestStatusCompleted,
    isLoadCustomerRequestStatusCompleted
  ) => {
    if (isLogin) {
      return !(
        isCheckLoginRequestCompleted &&
        isBusinessInfoRequestStatusCompleted &&
        isLoadCustomerRequestStatusCompleted
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

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);

export const getIsJoinNowButtonDisabled = state => state.business.membershipForm.isJoinNowButtonDisabled;
