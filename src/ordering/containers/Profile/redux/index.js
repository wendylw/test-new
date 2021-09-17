/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import _trim from 'lodash/trim';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import { updateProfile } from './thunk';

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
  showModal: '',
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

      const tirmedEmail = _trim(email);
      if (tirmedEmail.length > 0) {
        state.email = {
          data: tirmedEmail,
          isValid: Utils.checkEmailIsValid(tirmedEmail),
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
          data: birthday,
          isValid: Utils.checkBirthdayIsValid(tirmedBirthday),
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
    updateBirthday(state, action) {
      state.birthday.data = _trim(action.payload);
      state.birthday.isComplete = false;
    },
    completeEmail(state) {
      state.email.isValid = Utils.checkEmailIsValid(state.email.data);
      state.email.isComplete = true;
    },
    completeBirthday(state) {
      state.birthday.isValid = Utils.checkBirthdayIsValid(state.birthday.data);
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
    setModal(state, action) {
      state.showModal = action.payload;
    },
  },

  extraReducers: {
    [updateProfile.pending.type]: state => {
      state.updateProfileResult.status = API_REQUEST_STATUS.PENDING;
    },

    [updateProfile.fulfilled.type]: (state, action) => {
      state.updateProfileResult.data = action.payload;
      state.updateProfileResult.status = API_REQUEST_STATUS.FULFILLED;
      state.updateProfileResult.error = null;
    },

    [updateProfile.rejected.type]: (state, action) => {
      state.updateProfileResult.status = API_REQUEST_STATUS.REJECTED;
      state.updateProfileResult.error = action.error;
    },
  },
});

export default reducer;
