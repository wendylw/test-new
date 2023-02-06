/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import _trim from 'lodash/trim';
import { init, completePhoneNumber } from './thunk';

const initialState = {
  id: '',
  type: '',
  name: '',
  address: '',
  details: '',
  comments: '',
  coords: null,
  city: '',
  postCode: '',
  countryCode: '',
  contactNumber: '',
  contactName: '',
  contactNumberValidStatus: {
    isValid: false,
    isComplete: false,
  },
};

export const { actions, reducer } = createSlice({
  name: 'ordering/customer/addressDetail',
  initialState,
  reducers: {
    updateAddressInfo(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    removeAddressInfo() {
      return { ...initialState };
    },
    startEditPhoneNumber(state) {
      state.contactNumberValidStatus.isComplete = false;
    },
    updatePhoneNumber(state, action) {
      state.contactNumber = _trim(action.payload);
    },
  },

  extraReducers: {
    [init.fulfilled.type]: (state, action) => {
      const { payload } = action;

      state.id = payload.id;
      state.type = payload.type;
      state.contactNumber = payload.contactNumber;
      state.name = payload.name;
      state.address = payload.address;
      state.details = payload.details;
      state.comments = payload.comments;
      state.coords = payload.coords;
      state.city = payload.city;
      state.postCode = payload.postCode;
      state.countryCode = payload.countryCode;
      state.contactName = payload.contactName;
    },
    [completePhoneNumber.fulfilled.type]: (state, action) => {
      const { payload } = action;
      state.contactNumber = _trim(state.contactNumber);
      state.contactNumberValidStatus.isValid = payload;
      state.contactNumberValidStatus.isComplete = true;
    },
  },
});

export default reducer;
