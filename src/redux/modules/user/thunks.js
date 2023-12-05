import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApiRequestShippingType } from '../../../common/utils';
import Utils from '../../../utils/utils';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../utils/monitoring/constants';
import logger from '../../../utils/monitoring/logger';
import CleverTap from '../../../utils/clevertap';
import { getUserLoginStatus, postUserLogin, getUserProfile, postLoginGuest } from './api-request';
import { getConsumerId, getIsLogin } from './selectors';

const { getRegistrationTouchPoint, getRegistrationSource } = Utils;

/**
 * @param {undefined}
 * @return {Object} { consumerId, login }
 */
export const fetchUserLoginStatus = createAsyncThunk('app/user/getUserLoginStatus', async () => {
  try {
    const { consumerId = null, login = false } = await getUserLoginStatus();

    return { consumerId, login };
  } catch (error) {
    logger.error('User_FetchUserLoginStatusFailed', { message: error?.message });

    throw error;
  }
});

/**
 * @param {undefined}
 * @return {Object} {id, phone, firstName, lastName, email, gender, birthday, birthdayModifiedTime, notificationSettings, birthdayChangeAllowed }
 */
export const fetchUserProfileInfo = createAsyncThunk('app/user/fetchUserProfileInfo', async (_, { getState }) => {
  try {
    const state = getState();
    const consumerId = getConsumerId(state);

    const result = await getUserProfile(consumerId);

    return result;
  } catch (error) {
    logger.error('User_FetchUserProfileInfoFailed', { message: error?.message });

    throw error;
  }
});

export const initUserInfo = createAsyncThunk('app/user/initUserInfo', async (_, { dispatch, getState }) => {
  await dispatch(fetchUserLoginStatus());

  const isLogin = getIsLogin(getState());

  if (isLogin) {
    await dispatch(fetchUserProfileInfo());
  }
});

/**
 * @param {Object} { accessToken, refreshToken, shippingType }
 * @return {Object} { consumerId, user }
 */
export const loginUser = createAsyncThunk('app/user/loginUser', async ({ accessToken, refreshToken }) => {
  const shippingType = getApiRequestShippingType();

  try {
    const { consumerId = null, user = null } = await postUserLogin({
      accessToken,
      refreshToken,
      shippingType,
      registrationTouchpoint: getRegistrationTouchPoint(),
      registrationSource: getRegistrationSource(),
    });

    if (!consumerId) {
      throw new Error('User login Response does not contain consumerId');
    }

    const { phone, firstName, email, birthday, isFirstLogin } = user || {};

    CleverTap.pushEvent('Login - login successful', {
      'new user': isFirstLogin,
    });

    CleverTap.onUserLogin({
      Name: firstName,
      Phone: phone,
      Identity: consumerId,
      Email: email,
      DOB: birthday ? new Date(birthday) : undefined,
    });

    return { isFirstLogin };
  } catch (error) {
    CleverTap.pushEvent('Login - login failed');

    logger.error(
      'User_LoginFailed',
      {
        message: error?.message,
        shippingType,
      },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.LOGIN,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.LOGIN].SIGN_INTO_APP,
        },
        errorCategory: error?.category,
      }
    );

    throw error;
  }
});

export const syncUserLoginInfo = createAsyncThunk(
  'app/user/syncUserLoginInfo',
  async ({ accessToken, refreshToken }, { dispatch }) => {
    await dispatch(loginUser({ accessToken, refreshToken }));
    await dispatch(initUserInfo());
  }
);

export const loginUserAsGuest = createAsyncThunk('app/user/loginUserAsGuest', async () => {
  const result = await postLoginGuest();

  return result;
});
