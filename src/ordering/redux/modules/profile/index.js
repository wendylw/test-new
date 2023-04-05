import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { loadProfileInfo } from './thunks';

const initialState = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  birthday: '',
  gender: '',
  loadProfileInfoStatus: null,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/profile',
  initialState,
  reducers: {
    profileFirstNameUpdated: (state, { payload }) => {
      state.firstName = payload;
      state.name = payload;
    },
    profileLastNameUpdated: (state, { payload }) => {
      state.lastName = payload;
    },
    profileEmailUpdated: (state, { payload }) => {
      state.email = payload;
    },
    profileBirthdayUpdated: (state, { payload }) => {
      state.birthday = payload;
    },
  },
  extraReducers: {
    [loadProfileInfo.pending.type]: state => {
      state.loadProfileInfoStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadProfileInfo.fulfilled.type]: (state, { payload }) => {
      state.loadProfileInfoStatus = API_REQUEST_STATUS.FULFILLED;
      state.firstName = payload.firstName;
      state.lastName = payload.lastName;
      state.name = payload.firstName;
      state.email = payload.email;
      state.birthday = payload.birthday;
      state.gender = payload.gender;
    },
    [loadProfileInfo.rejected.type]: state => {
      state.loadProfileInfoStatus = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
