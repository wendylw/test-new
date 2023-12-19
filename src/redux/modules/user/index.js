import { createSlice } from '@reduxjs/toolkit';
import config from '../../../config';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';
import { fetchUserLoginStatus, fetchUserProfileInfo, loginUser, loginUserAsGuest } from './thunks';

const initialState = {
  checkLoginRequest: {
    data: {
      consumerId: null,
      login: false,
    },
    status: null,
    error: null,
  },
  loginRequest: {
    data: {
      isFirstLogin: false,
    },
    status: null,
    error: null,
  },
  guestLoginRequest: {
    data: {
      isGuest: config.isGuest,
    },
    status: null,
    error: null,
  },
  loadProfileRequest: {
    data: {
      id: null,
      phone: null,
      birthday: null,
      email: null,
      firstName: null,
      lastName: null,
      birthdayChangeAllowed: false,
      birthdayModifiedTime: null,
      gender: null,
      notificationSettings: null,
    },
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'app/address',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUserLoginStatus.pending.type]: state => {
      state.checkLoginRequest.status = API_REQUEST_STATUS.PENDING;
      state.checkLoginRequest.error = null;
    },
    [fetchUserLoginStatus.fulfilled.type]: (state, { payload }) => {
      const { consumerId, login } = payload;

      state.checkLoginRequest.data.consumerId = consumerId;
      state.checkLoginRequest.data.login = login;

      state.checkLoginRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.checkLoginRequest.error = null;
    },
    [fetchUserLoginStatus.rejected.type]: (state, { error }) => {
      state.checkLoginRequest.status = API_REQUEST_STATUS.REJECTED;
      state.checkLoginRequest.error = error;
    },
    [loginUser.pending.type]: state => {
      state.loginRequest.status = API_REQUEST_STATUS.PENDING;
      state.loginRequest.error = null;
    },
    [loginUser.fulfilled.type]: (state, { payload }) => {
      const { isFirstLogin } = payload;

      state.loginRequest.data.isFirstLogin = isFirstLogin;

      state.loginRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loginRequest.error = null;
    },
    [loginUser.rejected.type]: (state, { error }) => {
      state.loginRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loginRequest.error = error;
    },
    [fetchUserProfileInfo.pending.type]: state => {
      state.loadProfileRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadProfileRequest.error = null;
    },
    [fetchUserProfileInfo.fulfilled.type]: (state, { payload }) => {
      const {
        phone,
        birthday,
        email,
        firstName,
        lastName,
        birthdayChangeAllowed,
        birthdayModifiedTime,
        gender,
        notificationSettings,
      } = payload;

      state.loadProfileRequest.data.phone = phone;
      state.loadProfileRequest.data.birthday = birthday;
      state.loadProfileRequest.data.email = email;
      state.loadProfileRequest.data.firstName = firstName;
      state.loadProfileRequest.data.lastName = lastName;
      state.loadProfileRequest.data.birthdayChangeAllowed = birthdayChangeAllowed;
      state.loadProfileRequest.data.birthdayModifiedTime = birthdayModifiedTime;
      state.loadProfileRequest.data.gender = gender;
      state.loadProfileRequest.data.notificationSettings = notificationSettings;

      state.loadProfileRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadProfileRequest.error = null;
    },
    [fetchUserProfileInfo.rejected.type]: (state, { error }) => {
      state.loadProfileRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadProfileRequest.error = error;
    },
    [loginUserAsGuest.pending.type]: state => {
      state.guestLoginRequest.status = API_REQUEST_STATUS.PENDING;
      state.guestLoginRequest.error = null;
    },
    [loginUserAsGuest.fulfilled.type]: state => {
      state.guestLoginRequest.data.isGuest = true;
      state.guestLoginRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.guestLoginRequest.error = null;
    },
    [loginUserAsGuest.rejected.type]: (state, { error }) => {
      state.guestLoginRequest.status = API_REQUEST_STATUS.REJECTED;
      state.guestLoginRequest.error = error;
    },
  },
});

export default reducer;
export { actions };
