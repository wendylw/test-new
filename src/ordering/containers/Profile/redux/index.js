import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { profileUpdated, init, nameUpdated, emailUpdated, birthdayUpdated } from './thunk';

// if name, email or birthday is updated will inset state
const initialState = {
  name: '',
  email: '',
  birthday: '',
  profileUpdatedStatus: null,
  nameErrorType: null,
  emailErrorType: null,
  birthdayErrorType: null,
  nameInputCompletedStatus: false,
  emailInputCompletedStatus: false,
  birthdayInputCompletedStatus: false,
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
    [nameUpdated.fulfilled.type]: (state, { payload }) => {
      state.name = payload.name;
      state.nameErrorType = payload.errorType;
    },
    [emailUpdated.fulfilled.type]: (state, { payload }) => {
      state.email = payload.email;
      state.emailErrorType = payload.errorType;
    },
    [birthdayUpdated.fulfilled.type]: (state, { payload }) => {
      state.birthday = payload.birthday;
      state.birthdayErrorType = payload.errorType;
    },
  },
});

export default reducer;
