import { createSelector } from 'reselect';

export const getAddressInfo = state => state.customer.addressDetail;

export const getContactNumberIsValid = state => state.customer.addressDetail.contactNumberValidStatus.isValid;
export const getContactNumberIsComplete = state => state.customer.addressDetail.contactNumberValidStatus.isComplete;

export const getContactNumberInvalidErrorVisibility = createSelector(
  getContactNumberIsValid,
  getContactNumberIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);
