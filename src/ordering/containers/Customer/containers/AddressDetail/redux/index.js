/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import _trim from 'lodash/trim';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { init } from './thunk';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';

const initialState = {
  id: '',
  type: '',
  name: '',
  address: '',
  details: '',
  comments: '',
  coords: {
    longitude: 0,
    latitude: 0,
  },
  addressComponents: {},
  contactNumber: '',
  contactName: '',
  updateAddressDetailResult: {
    status: null,
    error: null,
  },
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
    completePhoneNumber(state) {
      state.contactNumber = _trim(state.contactNumber);
      state.contactNumberValidStatus.isValid = isValidPhoneNumber(state.contactNumber);
      state.contactNumberValidStatus.isComplete = true;
    },
  },

  extraReducers: {
    [init.pending.type]: state => {
      state.updateAddressDetailResult.status = API_REQUEST_STATUS.PENDING;
    },

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
      state.addressComponents = payload.addressComponents;
      state.contactName = payload.contactName;

      state.updateAddressDetailResult.status = API_REQUEST_STATUS.FULFILLED;
      state.updateAddressDetailResult.error = null;
    },
  },
});

export default reducer;
