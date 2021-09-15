/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { updateProfile } from './thunk';

const initialState = {
  name: '',
  email: '',
  birthday: '',
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
    updateProfileInfo(state, action) {
      return {
        ...state,
        ...action.payload,
      };
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
