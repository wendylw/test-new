import { createSelector } from 'reselect';
import { getIsLoginStatusLoaded, getLoadIsLoginStatusFailed } from '../../../../../redux/modules/app';

export const getAddressInfo = state => state.customer.addressDetail;

export const getContactNumberIsValid = state => state.customer.addressDetail.contactNumberValidStatus.isValid;
export const getContactNumberIsComplete = state => state.customer.addressDetail.contactNumberValidStatus.isComplete;

export const getContactNumberInvalidErrorVisibility = createSelector(
  getContactNumberIsValid,
  getContactNumberIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);

export const getContactNumber = state => state.customer.addressDetail.contactNumber;

export const getLoadIsLoginStatusComplete = createSelector(
  getIsLoginStatusLoaded,
  getLoadIsLoginStatusFailed,
  (isLoginStatusLoaded, loadIsLoginStatusFailed) => isLoginStatusLoaded || loadIsLoginStatusFailed
);
