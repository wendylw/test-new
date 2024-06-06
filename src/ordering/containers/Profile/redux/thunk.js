import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions, getUserConsumerId, getUserProfile } from '../../../redux/modules/app';
import { putProfileInfo } from './api-request';
import Utils from '../../../../utils/utils';
import { setCookieVariable } from '../../../../common/utils';
import { isValidBirthdayDateString, isAfterTodayBirthdayDate, getRequestBirthdayData } from '../utils';
import { PROFILE_SKIP_CYCLE, PROFILE_FIELD_ERROR_TYPES, PROFILE_BIRTHDAY_FORMAT } from '../utils/constants';
import { getProfileBirthday, getProfileEmail, getProfileFirstName, getProfileLastName } from './selectors';
import logger from '../../../../utils/monitoring/logger';

export const profileUpdated = createAsyncThunk('ordering/profile/profileUpdated', async (_, { dispatch, getState }) => {
  try {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const birthday = getProfileBirthday(state);
    const payload = {
      firstName: getProfileFirstName(state),
      lastName: getProfileLastName(state),
      email: getProfileEmail(state),
      birthday: getRequestBirthdayData(birthday),
    };

    const result = await putProfileInfo(consumerId, payload);

    // If profile info updated, should get new profile info for app level
    dispatch(appActions.updateProfile(payload));

    return result;
  } catch (error) {
    logger.error('Ordering_OrderStatus_ProfileUpdatedFailed', { message: error?.message });

    throw error;
  }
});

export const profileMissingSkippedLimitUpdated = createAsyncThunk(
  'ordering/profile/profileMissingSkippedLimitUpdated',
  () => {
    setCookieVariable('do_not_ask', '1', {
      expires: PROFILE_SKIP_CYCLE,
      path: '/',
      domain: Utils.getMainDomain(),
    });
  }
);

export const firstNameUpdated = createAsyncThunk('ordering/profile/firstNameUpdated', profileFirstName => {
  let errorType = null;

  if (!_trim(profileFirstName)) {
    errorType = PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  return {
    firstName: profileFirstName,
    errorType,
  };
});

export const lastNameUpdated = createAsyncThunk('ordering/profile/lastNameUpdated', profileLastName => ({
  lastName: profileLastName,
}));

export const emailUpdated = createAsyncThunk('ordering/profile/emailUpdated', profileEmail => {
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

export const birthdaySelected = createAsyncThunk('ordering/profile/birthdaySelected', profileBirthday => {
  const birthday = !profileBirthday ? '' : dayjs(_trim(profileBirthday)).format(PROFILE_BIRTHDAY_FORMAT);

  return {
    birthday,
    errorType: getBirthdayErrorType(birthday),
  };
});

// Birthday call birthdayUpdated, when browser unsupported showPicker()
export const birthdayUpdated = createAsyncThunk('ordering/profile/birthdayUpdated', profileBirthday => {
  const birthday = !profileBirthday ? '' : _trim(profileBirthday);

  return {
    birthday,
    errorType: getBirthdayErrorType(birthday),
  };
});

export const init = createAsyncThunk('ordering/profile/init', (_, { dispatch, getState }) => {
  const state = getState();
  const { firstName, lastName, email, birthday } = getUserProfile(state);

  // In fact, the profile data does not need to be returned with the redux merge of the page every time,
  // it only needs to be put in redux during initialization
  dispatch(firstNameUpdated(firstName));
  dispatch(lastNameUpdated(lastName));
  dispatch(emailUpdated(email));
  dispatch(birthdaySelected(birthday));
});
