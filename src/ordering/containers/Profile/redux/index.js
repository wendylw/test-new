/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import _trim from 'lodash/trim';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import { checkBirthdayIsValid } from '../utils';
import { saveProfileInfo } from './thunk';

const initialState = {
  name: {
    data: '',
    isValid: false,
    isComplete: false,
  },
  email: {
    data: '',
    isValid: false,
    isComplete: false,
  },
  birthday: {
    data: '',
    isValid: false,
    isComplete: false,
  },
  updateProfileResult: {
    status: null,
    error: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'ordering/profile',
  initialState,
  reducers: {
    init(state, action) {
      const { name, email, birthday } = action.payload;
      const birthdayDayjs = dayjs(birthday);

      const trimedEmail = _trim(email);
      if (trimedEmail.length > 0) {
        state.email = {
          data: trimedEmail,
          isValid: Utils.checkEmailIsValid(trimedEmail),
          isComplete: true,
        };
      } else {
        state.email = {
          ...initialState.email,
        };
      }

      state.name = {
        ...initialState.name,
        data: name,
      };

      const tirmedBirthday = _trim(birthday);
      if (tirmedBirthday.length > 0) {
        state.birthday = {
          data: birthdayDayjs.isValid() ? birthdayDayjs.format('DD/MM') : '',
          isValid: checkBirthdayIsValid(birthdayDayjs.format('DD/MM')),
          isComplete: true,
        };
      } else {
        state.birthday = {
          ...initialState.birthday,
        };
      }
    },
    updateName(state, action) {
      state.name.data = action.payload;
    },
    updateEmail(state, action) {
      state.email.data = _trim(action.payload);
      state.email.isComplete = false;
    },
    startEditName(state) {
      state.name.isComplete = false;
    },
    startEditEmail(state) {
      state.email.isComplete = false;
    },
    startEditBirthday(state) {
      state.birthday.isComplete = false;
    },
    updateBirthday(state, action) {
      state.birthday.data = _trim(action.payload);
    },
    completeName(state) {
      state.name.data = _trim(state.name.data);
      state.email.isComplete = true;
    },
    completeEmail(state) {
      state.email.isValid = Utils.checkEmailIsValid(state.email.data);
      state.email.isComplete = true;
    },
    completeBirthday(state) {
      state.birthday.isValid = checkBirthdayIsValid(state.birthday.data);
      state.birthday.isComplete = true;
    },
    resetUpdateProfileResult(state) {
      return {
        ...state,
        updateProfileResult: {
          ...initialState.updateProfileResult,
        },
      };
    },
    doNotAskAgain(state) {
      state.updateProfileResult = {
        ...state.updateProfileResult,
        ...initialState.updateProfileResult,
      };
    },
  },

  extraReducers: {
    [saveProfileInfo.pending.type]: state => {
      state.updateProfileResult.status = API_REQUEST_STATUS.PENDING;
    },

    [saveProfileInfo.fulfilled.type]: (state, action) => {
      state.updateProfileResult.data = action.payload;
      state.updateProfileResult.status = API_REQUEST_STATUS.FULFILLED;
      state.updateProfileResult.error = null;
    },

    [saveProfileInfo.rejected.type]: (state, action) => {
      state.updateProfileResult.status = API_REQUEST_STATUS.REJECTED;
      state.updateProfileResult.error = action.error;
    },
  },
});

export default reducer;