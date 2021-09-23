import { createSelector } from 'reselect';

export const getUpdateProfileError = state => state.profile.updateProfileResult.error;
export const getProfileName = state => state.profile.name.data;
export const getProfileEmail = state => state.profile.email.data;
export const getProfileBirthday = state => state.profile.birthday.data;

export const getProfileEmailIsValid = state => state.profile.email.isValid;
export const getProfileEmailIsComplete = state => state.profile.email.isComplete;

export const getEmailInvalidErrorVisibility = createSelector(
  getProfileEmailIsValid,
  getProfileEmailIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);

export const getProfileBirthdayIsValid = state => state.profile.birthday.isValid;
export const getProfileBirthdayIsComplete = state => state.profile.birthday.isComplete;

export const getbirthdayInvalidErrorVisibility = createSelector(
  getProfileBirthdayIsValid,
  getProfileBirthdayIsComplete,
  (isValid, isComplete) => !isValid && isComplete
);

export const getShowModal = state => state.profile.showModal;
