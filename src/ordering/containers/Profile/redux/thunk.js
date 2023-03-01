import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getIsProfileMissingSkippedExpired,
  getProfileName,
  getProfileEmail,
  getProfileBirthday,
  getProfileRequestData,
} from './selectors';
import {
  actions as appActionCreators,
  getUserConsumerId,
  getUserProfileStatus,
  getUserProfile,
  getUserIsLogin,
} from '../../../redux/modules/app';
import { updateProfileInfo, putProfileInfo } from './api-request';
import { convertToBackEndFormat } from '../utils';

export const init = createAsyncThunk('ordering/profile/init', async (_, { dispatch, getState }) => {
  const state = getState();
  const isLogin = getUserIsLogin(state);
  const consumerId = getUserConsumerId(state);
  const isProfileMissingSkippedExpired = getIsProfileMissingSkippedExpired(state);
  const profileDataStatus = getUserProfileStatus(state);

  // First must to confirm profile info is loaded
  if (isLogin && isProfileMissingSkippedExpired && (_isEmpty(profileDataStatus) || _isUndefined(profileDataStatus))) {
    await dispatch(appActionCreators.getProfileInfo(consumerId));
  }

  const profile = getUserProfile(getState());
  const { name, email, birthday } = profile || {};

  return { name, email, birthday };
});

export const profileUpdated = createAsyncThunk('ordering/profile/profileUpdated', async (_, { getState }) => {
  const state = getState();
  const payload = getProfileRequestData(state);
  const consumerId = getUserConsumerId(state);

  const result = await putProfileInfo(consumerId, payload);

  return result;
});

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
