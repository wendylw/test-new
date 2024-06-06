import _isNull from 'lodash/isNull';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getProfileFirstName = state => state.profile.firstName;

export const getFirstNameErrorType = state => state.profile.firstNameErrorType;

export const getIsValidFirstName = createSelector(getFirstNameErrorType, firstNameErrorType =>
  _isNull(firstNameErrorType)
);

export const getIsFirstNameInputFilled = state => state.profile.isFirstNameInputFilled;

export const getIsFirstNameInputErrorDisplay = createSelector(
  getIsFirstNameInputFilled,
  getIsValidFirstName,
  (isFirstNameInputFilled, isValidFirstName) => isFirstNameInputFilled && !isValidFirstName
);

export const getProfileLastName = state => state.profile.lastName;

export const getProfileEmail = state => state.profile.email;

export const getEmailErrorType = state => state.profile.emailErrorType;

export const getIsValidEmail = createSelector(getEmailErrorType, emailErrorType => _isNull(emailErrorType));

export const getIsEmailInputFilledStatus = state => state.profile.isEmailInputFilledStatus;

export const getIsEmailInputErrorDisplay = createSelector(
  getIsEmailInputFilledStatus,
  getIsValidEmail,
  (isEmailInputFilledStatus, isValidEmail) => isEmailInputFilledStatus && !isValidEmail
);

export const getProfileBirthday = state => state.profile.birthday;

export const getBirthdayErrorType = state => state.profile.birthdayErrorType;

export const getIsValidBirthday = createSelector(getBirthdayErrorType, birthdayErrorType => _isNull(birthdayErrorType));

export const getIsBirthdayInputFilledStatus = state => state.profile.isBirthdayInputFilledStatus;

export const getIsBirthdayInputErrorDisplay = createSelector(
  getIsBirthdayInputFilledStatus,
  getIsValidBirthday,
  (isBirthdayInputFilledStatus, isValidBirthday) => isBirthdayInputFilledStatus && !isValidBirthday
);

export const getIsProfileDataUpdating = state => state.profile.profileUpdatedStatus === API_REQUEST_STATUS.PENDING;

export const getIsDisabledProfileSaveButton = createSelector(
  getIsValidFirstName,
  getIsValidEmail,
  getIsValidBirthday,
  getIsProfileDataUpdating,
  (isValidFirstName, isValidEmail, isValidBirthday, isProfileDataUpdating) => {
    const isValidForm = isValidFirstName && isValidEmail && isValidBirthday;

    if (!isValidForm) {
      return true;
    }

    if (isProfileDataUpdating) {
      return true;
    }

    return false;
  }
);
