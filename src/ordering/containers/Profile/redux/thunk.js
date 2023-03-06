import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions, getUserConsumerId, getUserProfile } from '../../../redux/modules/app';
import { putProfileInfo } from './api-request';
import Utils from '../../../../utils/utils';
import { setCookieVariable } from '../../../../common/utils';
import { isValidBirthdayDateString, isAfterTodayBirthdayDate, getRequestBirthdayData } from '../utils';
import { PROFILE_SKIP_CYCLE, PROFILE_FIELD_ERROR_TYPES, PROFILE_BIRTHDAY_FORMAT } from '../utils/constants';
import { getProfileBirthday, getProfileEmail, getProfileName } from './selectors';
import logger from '../../../../utils/monitoring/logger';

export const profileUpdated = createAsyncThunk('ordering/profile/profileUpdated', async (_, { dispatch, getState }) => {
  try {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const birthday = getProfileBirthday(state);

    const result = await putProfileInfo(consumerId, {
      firstName: getProfileName(state),
      email: getProfileEmail(state),
      birthday: getRequestBirthdayData(birthday),
    });

    // If profile info updated, should get new profile info for app level
    dispatch(appActions.getProfileInfo(consumerId));

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

export const nameUpdated = createAsyncThunk('ordering/profile/nameUpdated', profileName => {
  const name = _trim(profileName);
  let errorType = null;

  if (!name) {
    errorType = PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  return {
    name,
    errorType,
  };
});

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

export const birthdayUpdated = createAsyncThunk('ordering/profile/birthdayUpdated', profileBirthday => {
  const birthday = !profileBirthday ? '' : dayjs(_trim(profileBirthday)).format(PROFILE_BIRTHDAY_FORMAT);
  let errorType = null;

  if (!birthday) {
    errorType = PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  } else if (!isValidBirthdayDateString(birthday)) {
    errorType = PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
  } else if (isAfterTodayBirthdayDate(birthday)) {
    // If selected birthday is after today, will display error
    errorType = PROFILE_FIELD_ERROR_TYPES.OUT_OF_DATE;
  }

  return {
    birthday,
    errorType,
  };
});

export const init = createAsyncThunk('ordering/profile/init', (_, { dispatch, getState }) => {
  const state = getState();
  const { name, email, birthday } = getUserProfile(state);

  // In fact, the profile data does not need to be returned with the redux merge of the page every time,
  // it only needs to be put in redux during initialization
  dispatch(nameUpdated(name));
  dispatch(emailUpdated(email));
  dispatch(birthdayUpdated(birthday));
});
