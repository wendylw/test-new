import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import { createSelector } from 'reselect';
import Utils from '../../../../utils/utils';
import { getCookieVariable, isSafari } from '../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { isValidBirthdayDateString, isAfterTodayBirthdayDate } from '../utils';
import { PROFILE_FIELD_ERROR_TYPES } from '../utils/constants';
import {
  getIsWebview,
  getIsUserProfileStatusFulfilled,
  getUserProfile,
  getUserIsLogin,
} from '../../../redux/modules/app';

export const getProfileName = state => state.profile.name || '';

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

export const getProfileEmail = state => state.profile.email || '';

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

export const getProfileBirthday = state => state.profile.birthday || '';

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

    // If selected birthday is after today, will display error
    if (isAfterTodayBirthdayDate(profileBirthday)) {
      return PROFILE_FIELD_ERROR_TYPES.OUT_OF_DATE;
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

export const getIsValidProfileForm = createSelector(
  getIsValidName,
  getIsValidEmail,
  getIsValidBirthday,
  (isValidName, isValidEmail, isValidBirthday) => isValidName && isValidEmail && isValidBirthday
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

export const getIsProfileDataNotUpdated = state => state.profile.profileUpdatedStatus !== API_REQUEST_STATUS.FULFILLED;

export const getIsProfileVisibility = createSelector(
  getIsUserProfileStatusFulfilled,
  getIsProfileDataNotUpdated,
  getIsProfileMissingSkippedExpired,
  getUserProfile,
  getUserIsLogin,
  (isUserProfileStatusFulfilled, isProfileDataNotUpdated, isProfileMissingSkippedExpired, profile, userIsLogin) => {
    const { name, email, birthday } = profile || {};
    const hasRequiredError = !name || !email || !birthday;

    if (
      isUserProfileStatusFulfilled &&
      isProfileDataNotUpdated &&
      isProfileMissingSkippedExpired &&
      hasRequiredError &&
      userIsLogin
    ) {
      return true;
    }

    return false;
  }
);

export const getIsNativeProfileDisplayFailed = state => state.profile.nativeProfileDisplayFailed;

export const getIsProfileWebVisibility = createSelector(
  getIsProfileVisibility,
  getIsWebview,
  getIsNativeProfileDisplayFailed,
  (isProfileWebVisibility, isWebview, nativeProfileDisplayFailed) =>
    isProfileWebVisibility && (!isWebview || nativeProfileDisplayFailed)
);

export const getIsProfileDataUpdating = state => state.profile.profileUpdatedStatus === API_REQUEST_STATUS.PENDING;

// For date input can be click in Safari
export const getIsSafari = state => isSafari();
