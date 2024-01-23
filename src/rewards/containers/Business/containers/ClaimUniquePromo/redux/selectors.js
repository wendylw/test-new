import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { CLAIM_UNIQUE_PROMO_ERROR_CODES } from '../utils/constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import {
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
  getIsLoadMerchantRequestCompleted,
  getLoadMerchantRequestError,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getIsCheckLoginRequestCompleted,
  getCheckLoginRequestError,
  getUserProfileRequestError,
} from '../../../../../../redux/modules/user/selectors';
import { getIsWeb } from '../../../../../redux/modules/common/selectors';

export const getUniquePromoRewardsSetId = () => getQueryString('rewardsSetId');

export const getUniquePromosRewardsUrl = state => getFeatureFlagResult(state, FEATURE_KEYS.CLAIM_UNIQUE_PROMO).introURL;

export const getUniquePromosCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.CLAIM_UNIQUE_PROMO).congratsURL;

export const getClaimUniquePromoRequestData = state => state.business.claimUniquePromo.claimUniquePromoRequest.data;

export const getClaimUniquePromoRequestStatus = state => state.business.claimUniquePromo.claimUniquePromoRequest.status;

export const getClaimUniquePromoRequestError = state => state.business.claimUniquePromo.claimUniquePromoRequest.error;

/**
 * Derived selectors
 */
export const getIsSkeletonLoaderShow = createSelector(
  getIsLoadMerchantRequestCompleted,
  getIsCheckLoginRequestCompleted,
  (isLoadMerchantRequestCompleted, isCheckLoginRequestCompleted) =>
    !isLoadMerchantRequestCompleted || !isCheckLoginRequestCompleted
);

export const getIsClaimUniquePromoRequestPending = createSelector(
  getClaimUniquePromoRequestStatus,
  claimUniquePromoRequestStatus => claimUniquePromoRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsClaimUniquePromoRequestFulfilled = createSelector(
  getClaimUniquePromoRequestStatus,
  claimUniquePromoRequestStatus => claimUniquePromoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsClaimUniquePromoRequestDuplicated = createSelector(
  getClaimUniquePromoRequestError,
  claimUniquePromoRequestError => claimUniquePromoRequestError?.code === CLAIM_UNIQUE_PROMO_ERROR_CODES.DUPLICATED_CLAIM
);

export const getIsCongratulationFooterDisplay = createSelector(
  getIsWeb,
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  (isWeb, isOROrderingEnabled, isDeliveryEnabled) => isWeb || (isOROrderingEnabled && isDeliveryEnabled)
);

export const getAnyInitialRequestError = createSelector(
  getLoadMerchantRequestError,
  getCheckLoginRequestError,
  getUserProfileRequestError,
  (loadMerchantRequestError, checkLoginRequestError, userProfileRequestError) =>
    loadMerchantRequestError || checkLoginRequestError || userProfileRequestError
);
