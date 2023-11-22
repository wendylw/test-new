import { createSlice } from '@reduxjs/toolkit';
import { fetchUserLoginStatus } from './thunks';
import { API_REQUEST_STATUS } from '../../../utils/constants';

const initialState = {
  checkLoginRequest: {
    data: {
      consumerId: null,
      login: false,
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

      state.checkLoginRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.checkLoginRequest.data.consumerId = consumerId;
      state.checkLoginRequest.data.login = login;
      state.checkLoginRequest.error = null;
    },
    [fetchUserLoginStatus.rejected.type]: (state, { error }) => {
      state.checkLoginRequest.status = API_REQUEST_STATUS.REJECTED;
      state.checkLoginRequest.error = error;
    },
  },
});

export default reducer;
export { actions };
