import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserConsumerId, getUserProfile } from '../../../redux/modules/app';
import { putProfileInfo } from './api-request';
import Utils from '../../../../utils/utils';
import { setCookieVariable } from '../../../../common/utils';
import { isValidBirthdayDateString, isAfterTodayBirthdayDate } from '../utils';
import { PROFILE_SKIP_CYCLE, PROFILE_FIELD_ERROR_TYPES } from '../utils/constants';

export const profileUpdated = createAsyncThunk('ordering/profile/profileUpdated', async (payload, { getState }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const state = getState();
    const { name, email, birthday } = getUserProfile(state);
    const consumerId = getUserConsumerId(state);

    const result = await putProfileInfo(consumerId, { name, email, birthday, ...payload });

    return result;
  } catch (error) {
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

export const validateName = createAsyncThunk('ordering/profile/validateName', profileName => {
  if (_isEmpty(profileName) || _isUndefined(profileName)) {
    return PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  return null;
});

export const validateEmail = createAsyncThunk('ordering/profile/validateName', profileEmail => {
  if (_isEmpty(profileEmail) || _isUndefined(profileEmail)) {
    return PROFILE_FIELD_ERROR_TYPES.REQUIRED;
  }

  // TODO: Migrate to v2
  if (!Utils.checkEmailIsValid(profileEmail)) {
    return PROFILE_FIELD_ERROR_TYPES.UNAVAILABLE;
  }

  return null;
});

export const validateBirthday = createAsyncThunk('ordering/profile/validateName', profileBirthday => {
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
});
