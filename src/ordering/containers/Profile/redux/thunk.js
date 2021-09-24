import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileName, getProfileEmail, getProfileBirthday } from './selectors';
import { getUserConsumerId } from '../../../redux/modules/app';
import { updateProfileInfo } from './api-request';
import { convertToBackEndFormat } from '../utils';

export const saveProfileInfo = createAsyncThunk('ordering/profile/saveProfileInfo', (_, { getState }) => {
  const state = getState();
  const name = getProfileName(state);
  const email = getProfileEmail(state);
  const birthday = getProfileBirthday(state);
  const birthdayTrans = convertToBackEndFormat(birthday);
  const consumerId = getUserConsumerId(state);
  return updateProfileInfo(consumerId, { name, email, birthday: birthdayTrans });
});
