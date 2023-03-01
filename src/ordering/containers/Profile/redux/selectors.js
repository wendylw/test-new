import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import { createSelector } from 'reselect';
import Utils from '../../../../utils/utils';
import { getCookieVariable, isSafari, isMobile } from '../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { isValidBirthdayDateString } from '../utils';
import { PROFILE_FIELD_ERROR_TYPES } from '../utils/constants';
import { getIsWebview, getIsUserProfileStatusFulfilled, getUserIsLogin } from '../../../redux/modules/app';

export const getProfileName = state => state.profile.name;

export const getIsValidName = createSelector(
  getProfileName,
  profileName => !_isEmpty(profileName) && !_isUndefined(profileName)
);

export const getNameErrorType = createSelector(getIsValidName, getProfileName, (isValidName, profileName) => {
  if (isValidName) {
    return null;
  }

  if (_isEmpty(profileName) || _isUndefined(profileName)) {
    return PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  return null;
});

export const getNameInputCompletedStatus = state => state.profile.nameInputCompletedStatus;

export const getIsNameInputErrorDisplay = createSelector(
  getNameInputCompletedStatus,
  getIsValidName,
  (nameInputCompletedStatus, isValidName) => nameInputCompletedStatus && !isValidName
);

export const getProfileEmail = state => state.profile.email;

export const getIsValidEmail = createSelector(
  getProfileEmail,
  profileEmail => !_isEmpty(profileEmail) && !_isUndefined(profileEmail) && Utils.checkEmailIsValid(profileEmail)
);

export const getEmailErrorType = createSelector(getIsValidEmail, getProfileEmail, (isValidEmail, profileEmail) => {
  if (isValidEmail) {
    return null;
  }

  if (_isEmpty(profileEmail) || _isUndefined(profileEmail)) {
    return PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  // TODO: Migrate to v2
  if (!Utils.checkEmailIsValid(profileEmail)) {
    return PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
  }

  return null;
});

export const getEmailInputCompletedStatus = state => state.profile.emailInputCompletedStatus;

export const getIsEmailInputErrorDisplay = createSelector(
  getEmailInputCompletedStatus,
  getIsValidEmail,
  (emailInputCompletedStatus, isValidEmail) => emailInputCompletedStatus && !isValidEmail
);

export const getProfileBirthday = state => state.profile.birthday;

export const getIsValidBirthday = createSelector(
  getProfileBirthday,
  profileBirthday =>
    !_isEmpty(profileBirthday) && !_isUndefined(profileBirthday) && isValidBirthdayDateString(profileBirthday)
);

export const getBirthdayErrorType = createSelector(
  getIsValidBirthday,
  getProfileBirthday,
  (isValidBirthday, profileBirthday) => {
    if (isValidBirthday) {
      return null;
    }

    if (_isEmpty(profileBirthday) || _isUndefined(profileBirthday)) {
      return PROFILE_FIELD_ERROR_TYPES.REQUIRED;
    }

    if (!isValidBirthdayDateString(profileBirthday)) {
      return PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
    }

    return null;
  }
);

export const getBirthdayInputCompletedStatus = state => state.profile.birthdayInputCompletedStatus;

export const getIsBirthdayInputErrorDisplay = createSelector(
  getBirthdayInputCompletedStatus,
  getIsValidBirthday,
  (birthdayInputCompletedStatus, isValidBirthday) => birthdayInputCompletedStatus && !isValidBirthday
);

export const getIsDisabledProfileSubmit = createSelector(
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
  (name, email, birthday) => {
    if (_isEmpty(name) || _isUndefined(name)) {
      return true;
    }

    if (_isEmpty(email) || _isUndefined(email)) {
      return true;
    }

    if (_isEmpty(birthday) || _isUndefined(birthday)) {
      return true;
    }

    return false;
  }
);

export const getProfileRequestData = createSelector(
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
  (profileName, profileEmail, profileBirthday) => ({
    firstName: profileName,
    email: profileEmail,
    birthday: profileBirthday,
  })
);

export const getIsProfileMissingSkippedExpired = state => getCookieVariable('do_not_ask') !== '1';

export const getIsProfileVisibility = createSelector(
  getIsUserProfileStatusFulfilled,
  getIsProfileMissingSkippedExpired,
  getNameErrorType,
  getEmailErrorType,
  getBirthdayErrorType,
  getIsWebview,
  getUserIsLogin,
  (
    isUserProfileStatusFulfilled,
    isProfileMissingSkippedExpired,
    nameErrorType,
    emailErrorType,
    birthdayErrorType,
    isWebview,
    userIsLogin
  ) => {
    const hasRequiredError =
      nameErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED ||
      emailErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED ||
      birthdayErrorType === PROFILE_FIELD_ERROR_TYPES.REQUIRED;

    if (
      isUserProfileStatusFulfilled &&
      isProfileMissingSkippedExpired &&
      hasRequiredError &&
      !isWebview &&
      userIsLogin
    ) {
      return true;
    }

    return false;
  }
);

export const getIsProfileDataUpdating = state => state.profile.profileUpdatedStatus === API_REQUEST_STATUS.PENDING;

// For date input can be click in Desktop Safari
export const getIsLaptopSafari = state => isSafari() && !isMobile();

// old
export const getUpdateProfileError = state => state.profile.updateProfileResult;

export const getProfileEmailIsValid = state => state.profile.email.isValid;
export const getProfileEmailIsComplete = state => state.profile.email.isComplete;

export const getEmailInvalidErrorVisibility = createSelector(
  getProfileEmailIsValid,
  getProfileEmailIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);

export const getProfileBirthdayIsValid = state => state.profile.birthday.isValid;
export const getProfileBirthdayIsComplete = state => state.profile.birthday.isComplete;

export const getBirthdayInvalidErrorVisibility = createSelector(
  getProfileBirthdayIsValid,
  getProfileBirthdayIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);

// export const getDuplicatedEmailAlertVisibility = state => state.profile.updateProfileResult.error?.code === '40024';
