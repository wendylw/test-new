import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileName, getProfileEmail, getProfileBirthday } from './selectors';
import { getUserConsumerId } from '../../../redux/modules/app';
import { updateProfileInfo } from './api-request';
// eslint-disable-next-line import/named
import { ConvertToBackEndFormat } from '../utils';

export const updateProfile = createAsyncThunk('ordering/profile', (_, { getState }) => {
  const state = getState();
  const name = getProfileName(state);
  const email = getProfileEmail(state);
  const birthday = getProfileBirthday(state);
  const birthdayTrans = ConvertToBackEndFormat(birthday);
  const consumerId = getUserConsumerId(state);
  return updateProfileInfo(consumerId, { name, email, birthday: birthdayTrans });
});
