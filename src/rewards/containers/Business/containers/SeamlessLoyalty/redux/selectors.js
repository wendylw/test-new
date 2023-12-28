import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import { getIsMerchantEnabledMembership } from '../../../../../redux/modules/merchant/selectors';
import { getCustomerTier, getLoadCustomerRequestCompleted } from '../../../../../redux/modules/customer/selectors';

export const getSeamlessLoyaltyRequestId = getQueryString('shareInfoReqId');

export const getIsRedirectToSeamlessLoyalty = createSelector(
  getIsMerchantEnabledMembership,
  getLoadCustomerRequestCompleted,
  (isMerchantEnabledMembership, loadMerchantRequestCompleted) =>
    loadMerchantRequestCompleted && !isMerchantEnabledMembership
);

export const getIsRedirectToMembershipDetail = createSelector(
  getIsMerchantEnabledMembership,
  getLoadMerchantRequestCompleted,
  getCustomerTier,
  getLoadCustomerRequestCompleted,
  (isMerchantEnabledMembership, loadMerchantRequestCompleted, customerTier, loadCustomerRequestCompleted) =>
    loadMerchantRequestCompleted && isMerchantEnabledMembership && loadCustomerRequestCompleted && customerTier
);
