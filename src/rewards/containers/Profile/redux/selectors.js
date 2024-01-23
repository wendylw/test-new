import _isNull from 'lodash/isNull';
import _trim from 'lodash/trim';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getProfileName = state => state.profile.name;

export const getIsValidName = createSelector(getProfileName, name => !!_trim(name));

export const getIsNameInputFilled = state => state.profile.isNameInputFilled;

export const getIsNameInputErrorDisplay = createSelector(
  getIsNameInputFilled,
  getIsValidName,
  (isNameInputFilled, isValidName) => isNameInputFilled && !isValidName
);

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
  getIsValidName,
  getIsValidEmail,
  getIsValidBirthday,
  getIsProfileDataUpdating,
  getHasProfileUpdated,
  (isValidName, isValidEmail, isValidBirthday, isProfileDataUpdating, hasProfileUpdated) => {
    const isValidForm = isValidName && isValidEmail && isValidBirthday;

    if (!isValidForm) {
      return true;
    }

    if (isProfileDataUpdating || hasProfileUpdated) {
      return true;
    }

    return false;
  }
);

// NOTE: This is a temporary decision to make it as prerequisite. But if feedback is customers push back, then in future we may make it skippable.
export const getShouldShowSkipButton = () => false;
