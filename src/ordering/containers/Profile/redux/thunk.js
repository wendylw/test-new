import { createAsyncThunk } from '@reduxjs/toolkit';
import { APP_TYPES } from '../../../redux/types';
import { getProfileName, getProfileEmail, getProfileBirthday } from './selectors';
import { getUserConsumerId } from '../../../redux/modules/app';
import { updateProfileInfo } from './api-request';
import Utils from '../../../../utils/utils';

export const types = APP_TYPES;
export const updateProfile = createAsyncThunk('ordering/profile', (_, { getState }) => {
  const state = getState();
  const name = getProfileName(state);
  const email = getProfileEmail(state);
  const birthday = getProfileBirthday(state);
  const birthdayTrans = Utils.transformBirthdayIsValid(birthday);
  const consumerId = getUserConsumerId(state);
  return updateProfileInfo(consumerId, { name, email, birthday: birthdayTrans });
});
