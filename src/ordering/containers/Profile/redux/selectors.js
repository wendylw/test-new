import _isNull from 'lodash/isNull';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getProfileName = state => state.profile.name;

export const getNameErrorType = state => state.profile.nameErrorType;

export const getIsValidName = createSelector(getNameErrorType, nameErrorType => _isNull(nameErrorType));

export const getNameInputCompletedStatus = state => state.profile.nameInputCompletedStatus;

export const getIsNameInputErrorDisplay = createSelector(
  getNameInputCompletedStatus,
  getIsValidName,
  (nameInputCompletedStatus, isValidName) => nameInputCompletedStatus && !isValidName
);

export const getProfileEmail = state => state.profile.email;

export const getEmailErrorType = state => state.profile.emailErrorType;

export const getIsValidEmail = createSelector(getEmailErrorType, emailErrorType => _isNull(emailErrorType));

export const getEmailInputCompletedStatus = state => state.profile.emailInputCompletedStatus;

export const getIsEmailInputErrorDisplay = createSelector(
  getEmailInputCompletedStatus,
  getIsValidEmail,
  (emailInputCompletedStatus, isValidEmail) => emailInputCompletedStatus && !isValidEmail
);

export const getProfileBirthday = state => state.profile.birthday;

export const getBirthdayErrorType = state => state.profile.birthdayErrorType;

export const getIsValidBirthday = createSelector(getBirthdayErrorType, birthdayErrorType => _isNull(birthdayErrorType));

export const getBirthdayInputCompletedStatus = state => state.profile.birthdayInputCompletedStatus;

export const getIsBirthdayInputErrorDisplay = createSelector(
  getBirthdayInputCompletedStatus,
  getIsValidBirthday,
  (birthdayInputCompletedStatus, isValidBirthday) => birthdayInputCompletedStatus && !isValidBirthday
);

export const getIsProfileDataUpdating = state => state.profile.profileUpdatedStatus === API_REQUEST_STATUS.PENDING;

export const getIsDisabledProfileSaveButton = createSelector(
  getIsValidName,
  getIsValidEmail,
  getIsValidBirthday,
  getIsProfileDataUpdating,
  (isValidName, isValidEmail, isValidBirthday, isProfileDataUpdating) => {
    const isValidForm = isValidName && isValidEmail && isValidBirthday;

    if (!isValidForm) {
      return true;
    }

    if (isProfileDataUpdating) {
      return true;
    }

    return false;
  }
);
