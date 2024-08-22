import _isNull from 'lodash/isNull';
import _trim from 'lodash/trim';
import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getProfileFirstName = state => state.profile.firstName;

export const getIsValidFirstName = createSelector(getProfileFirstName, firstName => !!_trim(firstName));

export const getIsFirstNameInputFilled = state => state.profile.isFirstNameInputFilled;

export const getIsFirstNameInputErrorDisplay = createSelector(
  getIsFirstNameInputFilled,
  getIsValidFirstName,
  (isFirstNameInputFilled, isValidFirstName) => isFirstNameInputFilled && !isValidFirstName
);

export const getProfileLastName = state => state.profile.lastName;

export const getProfileEmail = state => state.profile.email;

export const getEmailErrorType = state => state.profile.emailErrorType;

export const getIsValidEmail = createSelector(
  getProfileEmail,
  getEmailErrorType,
  (profileEmail, emailErrorType) => !_isEmpty(profileEmail) && _isNull(emailErrorType)
);

export const getIsEmailInputFilledStatus = state => state.profile.isEmailInputFilledStatus;

export const getIsEmailInputErrorDisplay = createSelector(
  getIsEmailInputFilledStatus,
  getIsValidEmail,
  (isEmailInputFilledStatus, isValidEmail) => isEmailInputFilledStatus && !isValidEmail
);

export const getProfileBirthday = state => state.profile.birthday;

export const getBirthdayErrorType = state => state.profile.birthdayErrorType;

export const getIsValidBirthday = createSelector(
  getProfileBirthday,
  getBirthdayErrorType,
  (profileBirthday, birthdayErrorType) => !_isEmpty(profileBirthday) && _isNull(birthdayErrorType)
);

export const getIsBirthdayInputFilledStatus = state => state.profile.isBirthdayInputFilledStatus;

export const getIsBirthdayInputErrorDisplay = createSelector(
  getIsBirthdayInputFilledStatus,
  getIsValidBirthday,
  (isBirthdayInputFilledStatus, isValidBirthday) => isBirthdayInputFilledStatus && !isValidBirthday
);

export const getProfileUpdatedStatus = state => state.profile.profileUpdatedStatus;

export const getIsProfileDataUpdating = createSelector(
  getProfileUpdatedStatus,
  profileUpdatedStatus => profileUpdatedStatus === API_REQUEST_STATUS.PENDING
);

export const getHasProfileUpdated = createSelector(
  getProfileUpdatedStatus,
  profileUpdatedStatus => profileUpdatedStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsDisabledProfileSaveButton = createSelector(
  getIsValidFirstName,
  getIsValidEmail,
  getIsValidBirthday,
  getIsProfileDataUpdating,
  getHasProfileUpdated,
  (isValidFirstName, isValidEmail, isValidBirthday, isProfileDataUpdating, hasProfileUpdated) => {
    const isValidForm = isValidFirstName && isValidEmail && isValidBirthday;

    if (!isValidForm) {
      return true;
    }

    if (isProfileDataUpdating || hasProfileUpdated) {
      return true;
    }

    return false;
  }
);
