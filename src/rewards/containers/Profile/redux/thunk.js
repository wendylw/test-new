import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserFirstName,
  getUserLastName,
  getUserEmail,
  getUserBirthday,
} from '../../../../redux/modules/user/selectors';
import { fetchUserProfileInfo, uploadUserProfileInfo } from '../../../../redux/modules/user/thunks';
import Utils from '../../../../utils/utils';
import { setCookieVariable } from '../../../../common/utils';
import { isValidBirthdayDateString, isAfterTodayBirthdayDate, getRequestBirthdayData } from '../utils';
import { showCompleteProfilePageAsync } from '../../../../utils/native-methods';
import { PROFILE_SKIP_CYCLE, PROFILE_FIELD_ERROR_TYPES, PROFILE_BIRTHDAY_FORMAT } from '../utils/constants';
import { getProfileBirthday, getProfileEmail, getProfileFirstName, getProfileLastName } from './selectors';

export const profileUpdated = createAsyncThunk('rewards/profile/profileUpdated', async (_, { dispatch, getState }) => {
  const state = getState();
  const birthday = getProfileBirthday(state);
  const payload = {
    firstName: getProfileFirstName(state),
    lastName: getProfileLastName(state),
    email: getProfileEmail(state),
    birthday: getRequestBirthdayData(birthday),
  };

  await dispatch(uploadUserProfileInfo(payload)).unwrap();

  // If profile info updated, should load latest profile info from backend.
  await dispatch(fetchUserProfileInfo());
});

export const profileMissingSkippedLimitUpdated = createAsyncThunk(
  'rewards/profile/profileMissingSkippedLimitUpdated',
  () => {
    setCookieVariable('do_not_ask', '1', {
      expires: PROFILE_SKIP_CYCLE,
      path: '/',
      domain: Utils.getMainDomain(),
    });
  }
);

export const firstNameUpdated = createAsyncThunk('rewards/profile/firstNameUpdated', firstName => firstName);

export const lastNameUpdated = createAsyncThunk('rewards/profile/lastNameUpdated', lastName => lastName);

export const emailUpdated = createAsyncThunk('rewards/profile/emailUpdated', profileEmail => {
  const email = _trim(profileEmail);
  let errorType = null;

  if (!email) {
    errorType = PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  } else if (!Utils.checkEmailIsValid(email)) {
    // TODO: Migrate to v2
    errorType = PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
  }

  return {
    email,
    errorType,
  };
});

const getBirthdayErrorType = birthday => {
  let errorType = null;

  if (!birthday) {
    errorType = PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  } else if (!isValidBirthdayDateString(birthday)) {
    errorType = PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
  } else if (isAfterTodayBirthdayDate(birthday)) {
    // If selected birthday is after today, will display error
    errorType = PROFILE_FIELD_ERROR_TYPES.OUT_OF_DATE;
  }

  return errorType;
};

export const birthdaySelected = createAsyncThunk('rewards/profile/birthdaySelected', profileBirthday => {
  const birthday = !profileBirthday ? '' : dayjs(_trim(profileBirthday)).format(PROFILE_BIRTHDAY_FORMAT);

  return {
    birthday,
    errorType: getBirthdayErrorType(birthday),
  };
});

// Birthday call birthdayUpdated, when browser unsupported showPicker()
export const birthdayUpdated = createAsyncThunk('rewards/profile/birthdayUpdated', profileBirthday => {
  const birthday = !profileBirthday ? '' : _trim(profileBirthday);

  return {
    birthday,
    errorType: getBirthdayErrorType(birthday),
  };
});

export const init = createAsyncThunk('rewards/profile/init', (_, { dispatch, getState }) => {
  const state = getState();
  const firstName = getUserFirstName(state);
  const lastName = getUserLastName(state);
  const email = getUserEmail(state);
  const birthday = getUserBirthday(state);

  // In fact, the profile data does not need to be returned with the redux merge of the page every time,
  // it only needs to be put in redux during initialization
  dispatch(firstNameUpdated(firstName));
  dispatch(lastNameUpdated(lastName));
  dispatch(emailUpdated(email));
  dispatch(birthdaySelected(birthday));
});
