import _trim from 'lodash/trim';
import dayjs from 'dayjs';
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { PROFILE_BIRTHDAY_FORMAT } from '../utils/constants';
import Utils from '../../../../utils/utils';
import { checkBirthdayIsValid } from '../utils';
import { saveProfileInfo, profileUpdated, init } from './thunk';

const initialState = {
  name: '',
  email: '',
  birthday: '',
  profileUpdatedStatus: API_REQUEST_STATUS.IDLE,
  nameInputCompletedStatus: false,
  emailInputCompletedStatus: false,
  birthdayInputCompletedStatus: false,
  // name: {
  //   data: '',
  //   isValid: false,
  //   isComplete: false,
  // },
  // email: {
  //   data: '',
  //   isValid: false,
  //   isComplete: false,
  // },
  // birthday: {
  //   data: '',
  //   isValid: false,
  //   isComplete: false,
  // },
  // updateProfileResult: {
  //   status: null,
  //   error: null,
  // },
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
    // init(state, action) {
    //   const { name, email, birthday } = action.payload;
    //   const birthdayDayjs = dayjs(birthday);

    //   const formattedEmail = _trim(email);
    //   if (formattedEmail.length > 0) {
    //     state.email = {
    //       data: formattedEmail,
    //       isValid: Utils.checkEmailIsValid(formattedEmail),
    //       isComplete: true,
    //     };
    //   } else {
    //     state.email = {
    //       ...initialState.email,
    //     };
    //   }

    //   state.name = {
    //     ...initialState.name,
    //     data: name,
    //   };

    //   const formattedBirthday = _trim(birthday);

    //   if (formattedBirthday.length > 0) {
    //     state.birthday = {
    //       data: birthdayDayjs.isValid() ? birthdayDayjs.format('DD/MM/YYYY') : '',
    //       isValid: checkBirthdayIsValid(birthdayDayjs.format('DD/MM/YYYY')),
    //       isComplete: true,
    //     };
    //   } else {
    //     state.birthday = {
    //       ...initialState.birthday,
    //     };
    //   }
    // },
    // updateName(state, action) {
    //   state.name.data = action.payload;
    // },
    // updateEmail(state, action) {
    //   state.email.data = _trim(action.payload);
    //   state.email.isComplete = false;
    // },
    // startEditName(state) {
    //   state.name.isComplete = false;
    // },
    // startEditEmail(state) {
    //   state.email.isComplete = false;
    // },
    // startEditBirthday(state) {
    //   state.birthday.isComplete = false;
    // },
    // updateBirthday(state, action) {
    //   state.birthday.data = _trim(action.payload);
    // },
    // completeName(state) {
    //   state.name.data = _trim(state.name.data);
    //   state.email.isComplete = true;
    // },
    // completeEmail(state) {
    //   state.email.isValid = Utils.checkEmailIsValid(state.email.data);
    //   state.email.isComplete = true;
    // },
    // completeBirthday(state) {
    //   state.birthday.isValid = checkBirthdayIsValid(state.birthday.data);
    //   state.birthday.isComplete = true;
    // },
    // resetUpdateProfileResult(state) {
    //   return {
    //     ...state,
    //     updateProfileResult: {
    //       ...initialState.updateProfileResult,
    //     },
    //   };
    // },
    // doNotAskAgain(state) {
    //   state.updateProfileResult = {
    //     ...state.updateProfileResult,
    //     ...initialState.updateProfileResult,
    //   };
    // },
  },

  extraReducers: {
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
    // [saveProfileInfo.pending.type]: state => {
    //   state.updateProfileResult.status = API_REQUEST_STATUS.PENDING;
    // },

    // [saveProfileInfo.fulfilled.type]: (state, action) => {
    //   state.updateProfileResult.data = action.payload;
    //   state.updateProfileResult.status = API_REQUEST_STATUS.FULFILLED;
    //   state.updateProfileResult.error = null;
    // },

    // [saveProfileInfo.rejected.type]: (state, action) => {
    //   state.updateProfileResult.status = API_REQUEST_STATUS.REJECTED;
    //   state.updateProfileResult.error = action.error;
    // },
  },
});

export default reducer;
