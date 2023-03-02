import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { profileUpdated, validateName, validateEmail, validateBirthday } from './thunk';

const initialState = {
  profileUpdatedStatus: null,
  nameErrorType: null,
  emailErrorType: null,
  birthdayErrorType: null,
  nameInputCompletedStatus: false,
  emailInputCompletedStatus: false,
  birthdayInputCompletedStatus: false,
  nativeProfileDisplayFailed: false,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/profile',
  initialState,
  reducers: {
    nameInputCompletedStatusUpdated: (state, { payload }) => {
      state.nameInputCompletedStatus = payload;
    },
    emailInputCompletedStatusUpdated: (state, { payload }) => {
      state.emailInputCompletedStatus = payload;
    },
    birthdaySelectorCompletedStatusUpdated: (state, { payload }) => {
      state.birthdayInputCompletedStatus = payload;
    },
  },
  extraReducers: {
    [profileUpdated.pending.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.PENDING;
    },
    [profileUpdated.fulfilled.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [profileUpdated.rejected.type]: state => {
      state.profileUpdatedStatus = API_REQUEST_STATUS.REJECTED;
    },
    [validateName.fulfilled.type]: (state, { payload }) => {
      state.nameErrorType = payload;
    },
    [validateEmail.fulfilled.type]: (state, { payload }) => {
      state.emailErrorType = payload;
    },
    [validateBirthday.fulfilled.type]: (state, { payload }) => {
      state.birthdayErrorType = payload;
    },
  },
});

export default reducer;
