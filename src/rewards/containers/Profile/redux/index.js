import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import {
  profileUpdated,
  firstNameUpdated,
  lastNameUpdated,
  emailUpdated,
  birthdaySelected,
  birthdayUpdated,
} from './thunk';

// if name, email or birthday is updated will inset state
const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  birthday: '',
  profileUpdatedStatus: null,
  emailErrorType: null,
  birthdayErrorType: null,
  isFirstNameInputFilled: false,
  isEmailInputFilledStatus: false,
  isBirthdayInputFilledStatus: false,
};

export const { actions, reducer } = createSlice({
  name: 'rewards/profile',
  initialState,
  reducers: {
    firstNameInputFilledStatusUpdated: (state, { payload }) => {
      state.isFirstNameInputFilled = payload;
    },
    emailInputFilledStatusUpdated: (state, { payload }) => {
      state.isEmailInputFilledStatus = payload;
    },
    birthdayInputFilledStatusUpdated: (state, { payload }) => {
      state.isBirthdayInputFilledStatus = payload;
    },
    resetProfilePageData: state => {
      state.firstName = '';
      state.lastName = '';
      state.email = '';
      state.birthday = '';
      state.profileUpdatedStatus = null;
      state.emailErrorType = null;
      state.birthdayErrorType = null;
      state.isFirstNameInputFilled = false;
      state.isEmailInputFilledStatus = false;
      state.isBirthdayInputFilledStatus = false;
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
    [firstNameUpdated.fulfilled.type]: (state, { payload }) => {
      state.firstName = payload;
    },
    [lastNameUpdated.fulfilled.type]: (state, { payload }) => {
      state.lastName = payload;
    },
    [emailUpdated.fulfilled.type]: (state, { payload }) => {
      state.email = payload.email;
      state.emailErrorType = payload.errorType;
    },
    [birthdaySelected.fulfilled.type]: (state, { payload }) => {
      state.birthday = payload.birthday;
      state.birthdayErrorType = payload.errorType;
    },
    [birthdayUpdated.fulfilled.type]: (state, { payload }) => {
      state.birthday = payload.birthday;
      state.birthdayErrorType = payload.errorType;
    },
  },
});

export default reducer;
