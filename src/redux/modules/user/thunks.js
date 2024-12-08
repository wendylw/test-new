import i18next from 'i18next';
import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApiRequestShippingType, isJSON } from '../../../common/utils';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../utils/monitoring/constants';
import logger from '../../../utils/monitoring/logger';
import CleverTap from '../../../utils/clevertap';
import { getUserLoginStatus, postUserLogin, getUserProfile, putProfileInfo, postLoginGuest } from './api-request';
import {
  getConsumerId,
  getIsLogin,
  getIsLoginExpired,
  getUserCountry,
  getIsUploadProfileFulfilled,
  getUserFirstName,
  getUserLastName,
  getUserEmail,
} from './selectors';
import Utils from '../../../utils/utils';
import { isAlipayMiniProgram, getAccessToken } from '../../../common/utils/alipay-miniprogram-client';
import { getTokenAsync, tokenExpiredAsync } from '../../../utils/native-methods';
import { toast, confirm } from '../../../common/utils/feedback';
import { REGISTRATION_SOURCE } from '../../../common/utils/constants';

const { getRegistrationTouchPoint, getRegistrationSource } = Utils;

/**
 * Serializes an error into a plain object.
 * NOTE: this function is copied from redux-toolkit repo.
 * DO NOT TOUCH THIS FUNCTION IF YOU DON'T KNOW WHAT YOU ARE DOING!
 *
 * @public
 */
export const serializeError = value => {
  const commonProperties = ['name', 'message', 'stack', 'code', 'error'];

  if (typeof value === 'object' && value !== null) {
    const simpleError = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const property of commonProperties) {
      if (typeof value[property] === 'string') {
        simpleError[property] = value[property];
      }
    }

    return simpleError;
  }

  return { message: String(value) };
};

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
  const state = getState();
  const consumerId = getConsumerId(state);
  const result = await getUserProfile(consumerId);

  return result;
});

/**
 * @param {undefined}
 * @return {Object} {firstName, email, birthday }
 */
export const uploadUserProfileInfo = createAsyncThunk(
  'app/user/uploadUserProfileInfo',
  async ({ firstName, lastName, email, birthday }, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);

    await putProfileInfo(consumerId, { firstName, lastName, email, birthday });
  }
);

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
export const loginUser = createAsyncThunk(
  'app/user/loginUser',
  async ({ accessToken, refreshToken }) => {
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
  },
  { serializeError }
);

export const syncUserLoginInfo = createAsyncThunk(
  'app/user/syncUserLoginInfo',
  async ({ accessToken, refreshToken }, { dispatch }) => {
    await dispatch(loginUser({ accessToken, refreshToken })).unwrap();
    await dispatch(initUserInfo());
  }
);

export const loginUserAsGuest = createAsyncThunk('app/user/loginUserAsGuest', async () => {
  const result = await postLoginGuest();

  return result;
});

export const loginUserByAlipayMiniProgram = createAsyncThunk(
  'app/user/loginUserByAlipayMiniProgram',
  async (business, { dispatch, getState }) => {
    const state = getState();
    const userCountry = getUserCountry(state);

    if (!isAlipayMiniProgram()) {
      throw new Error('Not in Alipay mini program');
    }

    try {
      const tokens = await getAccessToken({ business });

      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      await dispatch(syncUserLoginInfo({ accessToken, refreshToken }));
    } catch (error) {
      const isJSONErrorMessage = isJSON(error?.message);

      if (isJSONErrorMessage) {
        const { error: errorCode } = JSON.parse(error.message) || {};

        errorCode === 10 &&
          confirm(i18next.t('Common:UnexpectedErrorOccurred'), {
            closeByBackButton: false,
            closeByBackDrop: false,
            cancelButtonContent: i18next.t('Common:Cancel'),
            confirmButtonContent: i18next.t('Common:TryAgain'),
            onSelection: async confirmStatus => {
              if (confirmStatus) {
                // try again
                CleverTap.pushEvent('Loyalty Page (Login Error Pop-up) - Click Try Again', {
                  country: userCountry,
                });
                await dispatch(loginUserByAlipayMiniProgram());
              } else {
                // cancel
                if (window.my.exitMiniProgram) {
                  window.my.exitMiniProgram();
                }

                CleverTap.pushEvent('Loyalty Page (Login Error Pop-up) - Click Cancel', {
                  country: userCountry,
                });
              }
            },
          });
      }

      CleverTap.pushEvent('Login - login failed');

      logger.error('Common_LoginByAlipayMiniProgramFailed', { message: error?.message });

      throw error;
    }
  }
);

export const loginUserByBeepApp = createAsyncThunk('app/user/loginByBeepApp', async (_, { dispatch, getState }) => {
  try {
    const tokens = await getTokenAsync();
    const { access_token: accessToken, refresh_token: refreshToken } = tokens;

    if (_isEmpty(accessToken) || _isEmpty(refreshToken)) return;

    const source = REGISTRATION_SOURCE.BEEP_APP;

    await dispatch(syncUserLoginInfo({ accessToken, refreshToken, source }));

    const isTokenExpired = getIsLoginExpired(getState());

    if (isTokenExpired) {
      const validTokens = await tokenExpiredAsync();

      await dispatch(
        syncUserLoginInfo({ accessToken: validTokens.access_token, refreshToken: validTokens.refresh_token, source })
      );
    }
  } catch (e) {
    if (e?.code === 'B0001') {
      toast(i18next.t('ApiError:B0001Description'));
    } else {
      toast(i18next.t('Common:UnknownError'));
    }

    logger.error('Common_LoginByBeepAppFailed', { message: e?.message, code: e?.code });
  }
});

export const updateUserProfileInfo = createAsyncThunk(
  'app/user/updateUserProfileInfo',
  async ({ firstName, lastName, email, birthday }, { dispatch, getState }) => {
    await dispatch(uploadUserProfileInfo({ firstName, lastName, email, birthday }));

    const isUploadProfileFulfilled = getIsUploadProfileFulfilled(getState());

    if (isUploadProfileFulfilled) {
      dispatch(fetchUserProfileInfo());
    }
  }
);

export const updateUserBirthdayInfo = createAsyncThunk(
  'app/user/updateUserProfileInfo',
  async (birthday, { dispatch, getState }) => {
    const state = getState();
    const firstName = getUserFirstName(state) || '';
    const lastName = getUserLastName(state) || '';
    const email = getUserEmail(state) || '';

    await dispatch(uploadUserProfileInfo({ firstName, lastName, email, birthday }));

    const isUploadProfileFulfilled = getIsUploadProfileFulfilled(getState());

    if (isUploadProfileFulfilled) {
      dispatch(fetchUserProfileInfo());
    }
  }
);
