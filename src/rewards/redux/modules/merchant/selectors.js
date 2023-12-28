import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getQueryString } from '../../../../common/utils';

/**
 * @returns {string | null} business
 */
export const getMerchantBusiness = () => getQueryString('business');

export const getMerchantData = state => state.merchant.loadMerchantRequest.data;

export const getLoadMerchantRequestStatus = state => state.merchant.loadMerchantRequest.status;

export const getLoadMerchantRequestError = state => state.merchant.loadMerchantRequest.error;

export const getMerchantLogo = createSelector(getMerchantData, merchantData => _get(merchantData, 'logo', null));

export const getMerchantDisplayName = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'displayName', '')
);

export const getMerchantCountry = createSelector(getMerchantData, merchantData => _get(merchantData, 'country', ''));

export const getMerchantCurrency = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'currency', null)
);

export const getMerchantLocale = createSelector(getMerchantData, merchantData => _get(merchantData, 'locale', null));

export const getIsMerchantEnabledOROrdering = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'isQROrderingEnabled', false)
);

export const getIsMerchantEnabledCashback = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'enableCashback', false)
);

export const getIsMerchantEnabledMembership = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'membershipEnabled', false)
);

export const getIsMerchantEnabledDelivery = createSelector(getMerchantData, merchantData =>
  _get(merchantData, 'qrOrderingSettings.enableDelivery', false)
);

/**
 * Derived selectors
 */

export const getLoadMerchantRequestCompleted = createSelector(
  getLoadMerchantRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED || status === API_REQUEST_STATUS.REJECTED
);
