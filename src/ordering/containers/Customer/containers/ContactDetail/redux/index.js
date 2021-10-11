/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  phone: '',
};

export const { actions, reducer } = createSlice({
  name: 'ordering/customer/contactDetail',
  initialState,
  reducers: {
    init(state, action) {
      state.username = action.payload.username;
      state.phone = action.payload.phone;
    },

    updateUserName(state, action) {
      state.username = action.payload;
    },

    updatePhone(state, action) {
      state.phone = action.payload;
    },
  },
});

export default reducer;

export const getUsername = state => state.customer.contactDetail.username;

export const getPhone = state => state.customer.contactDetail.phone;
