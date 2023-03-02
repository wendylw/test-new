import _isNull from 'lodash/isNull';
import { createSelector } from 'reselect';
import { isSafari } from '../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { PROFILE_FIELD_ERROR_TYPES } from '../utils/constants';

export const getNameErrorType = state => state.profile.nameErrorType;

export const getIsValidName = createSelector(getNameErrorType, nameErrorType => !_isNull(nameErrorType));

export const getNameInputCompletedStatus = state => state.profile.nameInputCompletedStatus;

export const getIsNameInputErrorDisplay = createSelector(
  getNameInputCompletedStatus,
  getIsValidName,
  (nameInputCompletedStatus, isValidName) => nameInputCompletedStatus && !isValidName
);

export const getEmailErrorType = state => state.profile.emailErrorType;

export const getIsValidEmail = createSelector(getEmailErrorType, emailErrorType => !_isNull(emailErrorType));

export const getEmailInputCompletedStatus = state => state.profile.emailInputCompletedStatus;

export const getIsEmailInputErrorDisplay = createSelector(
  getEmailInputCompletedStatus,
  getIsValidEmail,
  (emailInputCompletedStatus, isValidEmail) => emailInputCompletedStatus && !isValidEmail
);

export const getBirthdayErrorType = state => state.profile.birthdayErrorType;

export const getIsValidBirthday = createSelector(
  getBirthdayErrorType,
  birthdayErrorType => !_isNull(birthdayErrorType)
);

export const getBirthdayInputCompletedStatus = state => state.profile.birthdayInputCompletedStatus;

export const getIsBirthdayInputErrorDisplay = createSelector(
  getBirthdayInputCompletedStatus,
  getIsValidBirthday,
  (birthdayInputCompletedStatus, isValidBirthday) => birthdayInputCompletedStatus && !isValidBirthday
);

export const getIsValidProfileForm = createSelector(
  getIsValidName,
  getIsValidEmail,
  getIsValidBirthday,
  (isValidName, isValidEmail, isValidBirthday) => isValidName && isValidEmail && isValidBirthday
);

export const getIsProfileDataUpdating = state => state.profile.profileUpdatedStatus === API_REQUEST_STATUS.PENDING;

export const getIsDisabledProfileSaveButton = createSelector(
  getNameErrorType,
  getEmailErrorType,
  getBirthdayErrorType,
  getIsProfileDataUpdating,
  (nameErrorType, emailErrorType, birthdayErrorType, isProfileDataUpdating) => {
    const hasRequiredError =
      nameErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED ||
      emailErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED ||
      birthdayErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED;

    if (hasRequiredError) {
      return true;
    }

    if (isProfileDataUpdating) {
      return true;
    }

    return false;
  }
);

// For date input can be click in Safari
export const getIsSafari = state => isSafari();
