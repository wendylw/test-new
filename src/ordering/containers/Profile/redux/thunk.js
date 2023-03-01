import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getIsProfileMissingSkippedExpired, getProfileRequestData, getIsProfileVisibility } from './selectors';
import {
  actions as appActionCreators,
  getUserConsumerId,
  getUserProfileStatus,
  getUserProfile,
  getUserIsLogin,
  getIsWebview,
} from '../../../redux/modules/app';
import { putProfileInfo } from './api-request';
import * as NativeMethods from '../../../../utils/native-methods';
import Utils from '../../../../utils/utils';
import { setCookieVariable } from '../../../../common/utils';

export const nativeProfileShown = createAsyncThunk('ordering/profile/nativeProfileShown', async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    await NativeMethods.showCompleteProfilePageAsync();

    return true;
  } catch (error) {
    throw error;
  }
});

export const init = createAsyncThunk('ordering/profile/init', async (_, { dispatch, getState }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const state = getState();
    const isWebview = getIsWebview(state);
    const isLogin = getUserIsLogin(state);
    const consumerId = getUserConsumerId(state);
    const isProfileMissingSkippedExpired = getIsProfileMissingSkippedExpired(state);
    const profileDataStatus = getUserProfileStatus(state);

    // First must to confirm profile info is loaded
    if (isLogin && isProfileMissingSkippedExpired && (_isEmpty(profileDataStatus) || _isUndefined(profileDataStatus))) {
      await dispatch(appActionCreators.getProfileInfo(consumerId));
    }

    const isProfileVisibility = getIsProfileVisibility(getState());

    if (isWebview && isProfileVisibility) {
      await dispatch(nativeProfileShown());
    }

    const profile = getUserProfile(getState());
    const { name, email, birthday } = profile || {};

    return { name, email, birthday };
  } catch (error) {
    throw error;
  }
});

export const profileUpdated = createAsyncThunk('ordering/profile/profileUpdated', async (_, { getState }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const state = getState();
    const payload = getProfileRequestData(state);
    const consumerId = getUserConsumerId(state);

    const result = await putProfileInfo(consumerId, payload);

    return result;
  } catch (error) {
    throw error;
  }
});

export const profileMissingSkippedLimitUpdated = createAsyncThunk('ordering/profile/profileUpdated', () => {
  setCookieVariable('do_not_ask', '1', {
    expires: 3650,
    path: '/',
    domain: Utils.getMainDomain(),
  });
});
