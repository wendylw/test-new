import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getPrice } from '../../../../../common/utils';
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

export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember) => isJoinMembershipNewMember || isConfirmSharingNewMember
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

    const days = getDifferenceTodayInDays(cashbackExpiredDate);

    return days < 8 ? days : null;
  }
);
