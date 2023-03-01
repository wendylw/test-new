import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { PROFILE_BIRTHDAY_FORMAT } from '../utils/constants';
import { profileUpdated, nativeProfileShown, init } from './thunk';

const initialState = {
  name: '',
  email: '',
  birthday: '',
  profileUpdatedStatus: API_REQUEST_STATUS.IDLE,
  nameInputCompletedStatus: false,
  emailInputCompletedStatus: false,
  birthdayInputCompletedStatus: false,
  webViewProfileDisplayFailed: false,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/profile',
  initialState,
  reducers: {
    nameUpdated: (state, { payload }) => {
      state.name = payload;
    },
    nameInputCompletedStatusUpdated: (state, { payload }) => {
      state.nameInputCompletedStatus = payload;
    },
    emailUpdated: (state, { payload }) => {
      state.email = _trim(payload);
    },
    emailInputCompletedStatusUpdated: (state, { payload }) => {
      state.emailInputCompletedStatus = payload;
    },
    birthDayUpdated: (state, { payload }) => {
      state.birthday = dayjs(_trim(payload)).format(PROFILE_BIRTHDAY_FORMAT);
      state.birthdayInputCompletedStatus = true;
    },
  },
  extraReducers: {
    [nativeProfileShown.fulfilled.type]: state => {
      state.webViewProfileDisplayFailed = false;
    },
    [nativeProfileShown.rejected.type]: state => {
      state.webViewProfileDisplayFailed = true;
    },
    [init.fulfilled.type]: (state, { payload }) => {
      state.name = payload.name;
      state.email = _trim(payload.email);
      state.birthday = _trim(payload.birthday);
    },
    [profileUpdated.pending.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.PENDING;
    },
    [profileUpdated.fulfilled.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [profileUpdated.rejected.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
