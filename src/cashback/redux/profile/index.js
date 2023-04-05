import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';
import { loadProfileInfo } from './thunks';

// if name, email or birthday is updated will inset state
const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  birthday: '',
  gender: '',
  loadProfileInfoStatus: null,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/profile',
  initialState,
  reducers: {},
  extraReducers: {
    [loadProfileInfo.pending.type]: state => {
      state.loadProfileInfoStatus = API_REQUEST_STATUS.PENDING;
    },
    [loadProfileInfo.fulfilled.type]: (state, { payload }) => {
      state.loadProfileInfoStatus = API_REQUEST_STATUS.FULFILLED;
      state.firstName = payload.firstName;
      state.lastName = payload.lastName;
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
