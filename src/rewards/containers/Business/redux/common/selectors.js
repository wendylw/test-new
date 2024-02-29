import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { CLAIM_CASHBACK_QUERY_NAMES, CLAIM_CASHBACK_TYPES } from '../../../../../common/utils/constants';
import { getPrice, getQueryString } from '../../../../../common/utils';
import { getDifferenceTodayInDays } from '../../../../../utils/datetime-lib';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';
import {
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getCustomerCashback,
  getCashbackExpiredDate,
  getIsCashbackExpired,
} from '../../../../redux/modules/customer/selectors';

export const getOrderReceiptClaimedCashbackStatus = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.STATUS);

export const getOrderReceiptClaimedCashbackType = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.CASHBACK_TYPE);

export const getOrderReceiptClaimedCashbackValue = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.VALUE);

export const getIsClaimedOrderCashbackNewMember = () => getQueryString('isNewMember') === 'true';

export const getConfirmSharingConsumerInfoData = state => state.business.common.confirmSharingConsumerInfoRequest.data;

export const getConfirmSharingConsumerInfoStatus = state =>
  state.business.common.confirmSharingConsumerInfoRequest.status;

export const getConfirmSharingConsumerInfoError = state =>
  state.business.common.confirmSharingConsumerInfoRequest.error;

export const getIsConfirmSharingNewCustomer = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'isNewCustomer', false)
);

export const getIsConfirmSharingNewMember = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'joinMembershipResult.isNewMember', false)
);

/**
 * Derived selectors
 */
export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  getIsClaimedOrderCashbackNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember, isClaimedOrderCashbackNewMember) =>
    isJoinMembershipNewMember || isConfirmSharingNewMember || isClaimedOrderCashbackNewMember
);

export const getCustomerCashbackPrice = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);

export const getRemainingCashbackExpiredDays = createSelector(
  getCashbackExpiredDate,
  getIsCashbackExpired,
  (cashbackExpiredDate, isCashbackExpired) => {
    if (!cashbackExpiredDate || isCashbackExpired) {
      return null;
    }

    const days = getDifferenceTodayInDays(new Date(cashbackExpiredDate));

    return days > -8 && days <= 0 ? Math.floor(Math.abs(days)) : null;
  }
);

export const getIsTodayExpired = createSelector(
  getRemainingCashbackExpiredDays,
  remainingCashbackExpiredDays => remainingCashbackExpiredDays === 0
);

export const getIsExpiringTagShown = createSelector(
  getRemainingCashbackExpiredDays,
  remainingCashbackExpiredDays => remainingCashbackExpiredDays !== null
);

export const getOrderReceiptClaimedCashback = createSelector(
  getOrderReceiptClaimedCashbackType,
  getOrderReceiptClaimedCashbackValue,
  (claimedCashbackType, claimedCashbackValue) => {
    if (claimedCashbackType === CLAIM_CASHBACK_TYPES.PERCENTAGE) {
      return `${claimedCashbackValue}%`;
    }

    if (claimedCashbackType === CLAIM_CASHBACK_TYPES.ABSOLUTE) {
      return decodeURIComponent(claimedCashbackValue);
    }

    return '';
  }
);
