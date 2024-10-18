import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchUserProfileInfo,
  updateUserBirthdayInfo,
  updateUserProfileInfo,
} from '../../../../redux/modules/user/thunks';
import {
  getUserFirstName,
  getUserLastName,
  getUserEmail,
  getUserBirthday,
} from '../../../../redux/modules/user/selectors';
import { getProfileFirstName, getProfileLastName, getProfileEmail, getRequestBirthday } from './selectors';

export const showUpdateBirthdayForm = createAsyncThunk('profile/showUpdateBirthdayForm', async () => {});

export const hideUpdateBirthdayForm = createAsyncThunk('profile/hideUpdateBirthdayForm', async () => {});

export const mount = createAsyncThunk('profile/mount', async (isCompleteBirthdayFirst, { dispatch, getState }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    await dispatch(fetchUserProfileInfo()).unwrap();

    const firstName = getUserFirstName(getState());
    const lastName = getUserLastName(getState());
    const email = getUserEmail(getState());
    const birthday = getUserBirthday(getState());

    if (isCompleteBirthdayFirst && _isEmpty(birthday)) {
      dispatch(showUpdateBirthdayForm());
    }

    return {
      firstName,
      lastName,
      email,
      birthday,
    };
  } catch (error) {
    throw error;
  }
});

export const saveBirthdayInfo = createAsyncThunk('profile/saveBirthdayInfo', async (_, { dispatch, getState }) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const state = getState();
    const birthday = getRequestBirthday(state);

    await dispatch(updateUserBirthdayInfo(birthday)).unwrap();

    dispatch(hideUpdateBirthdayForm());
  } catch (error) {
    throw error;
  }
});

export const saveUserProfileInfo = createAsyncThunk(
  'profile/saveUserProfileInfo',
  async (_, { dispatch, getState }) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const state = getState();
      const firstName = getProfileFirstName(state);
      const lastName = getProfileLastName(state);
      const email = getProfileEmail(state);
      const birthday = getRequestBirthday(state);

      await dispatch(updateUserProfileInfo({ firstName, lastName, email, birthday })).unwrap();
    } catch (error) {
      throw error;
    }
  }
);
