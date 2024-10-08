import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getReduceOneSecondForDate } from '../../../../utils/datetime-lib';
import { getUserBirthday, getIsUserProfileIncomplete } from '../../../../redux/modules/user/selectors';

export const getProfileRequestData = state => state.completeProfile.formData || {};

export const getProfileFirstName = createSelector(
  getProfileRequestData,
  profileRequestData => profileRequestData.firstName
);

export const getProfileLastName = createSelector(
  getProfileRequestData,
  profileRequestData => profileRequestData.lastName
);

export const getProfileEmail = createSelector(getProfileRequestData, profileRequestData => profileRequestData.email);

export const getProfileBirthday = createSelector(
  getProfileRequestData,
  profileRequestData => profileRequestData.birthday
);

export const getUpdateBirthdayRequestStatus = state => state.completeProfile.updateBirthdayRequest.status;

export const getUpdateBirthdayRequestError = state => state.completeProfile.updateBirthdayRequest.error;

export const getMountProfileRequestStatus = state => state.completeProfile.mountRequest.status;

export const getUpdateProfileRequestStatus = state => state.completeProfile.updateProfileRequest.status;

export const getIsUpdateBirthdayRequestShow = state => state.completeProfile.showBirthdayForm;

/**
 * Derived selectors
 */

export const getIsUpdateBirthdayRequestPending = createSelector(
  getUpdateBirthdayRequestStatus,
  updateBirthdayRequestStatus => updateBirthdayRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsProfileRequestMountStatusPending = createSelector(
  getMountProfileRequestStatus,
  profileRequestStatus => profileRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsUpdateProfileRequestStatusPending = createSelector(
  getUpdateProfileRequestStatus,
  updateProfileRequestStatus => updateProfileRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsUpdateProfileRequestStatusFulfilled = createSelector(
  getUpdateProfileRequestStatus,
  updateProfileRequestStatus => updateProfileRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getRequestBirthday = createSelector(getProfileBirthday, profileBirthday =>
  getReduceOneSecondForDate(new Date(profileBirthday))
);

export const getIsBirthdayEmpty = createSelector(
  getUserBirthday,
  getIsUserProfileIncomplete,
  (userBirthday, isUserProfileIncomplete) => isUserProfileIncomplete && !userBirthday
);

export const getIsProcessingShow = createSelector(
  getIsUpdateBirthdayRequestPending,
  getIsUpdateProfileRequestStatusPending,
  (isUpdateBirthdayRequestPending, isUpdateProfileRequestStatusPending) =>
    isUpdateBirthdayRequestPending || isUpdateProfileRequestStatusPending
);
