import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileName, getProfileEmail, getProfileBirthday } from './selectors';
import { getUserConsumerId, actions as appActionCreators } from '../../../redux/modules/app';
import { updateProfileInfo } from './api-request';
import { convertToBackEndFormat } from '../utils';

export const saveProfileInfo = createAsyncThunk(
  'ordering/profile/saveProfileInfo',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const name = getProfileName(state);
    const email = getProfileEmail(state);
    const birthday = getProfileBirthday(state);
    const birthdayTrans = convertToBackEndFormat(birthday);
    const consumerId = getUserConsumerId(state);
    const profileInfo = { name, email, birthday: birthdayTrans };
    const result = await updateProfileInfo(consumerId, profileInfo);

    dispatch(appActionCreators.updateProfileInfo(profileInfo));
    return result;
  }
);
