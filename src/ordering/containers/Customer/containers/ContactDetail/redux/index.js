/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import _trim from 'lodash/trim';
import { actions as appActionCreators, getUserConsumerId, getDeliveryDetails } from '../../../../../redux/modules/app';
import { updateAddress } from '../../../../../redux/modules/addressList/api-request';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { actions as addressListActions } from '../../../../../redux/modules/addressList/index';

const initialState = {
  username: '',
  phone: '',
  updateContactDetailResult: {
    error: null,
    status: null,
  },
};

export const getUsername = state => state.customer.contactDetail.username;

export const getPhone = state => state.customer.contactDetail.phone;

export const updateContactDetail = createAsyncThunk(
  'ordering/customer/common/updateContactDetail',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState();
      const consumerId = getUserConsumerId(state);
      const { addressId } = getDeliveryDetails(state);
      const contactName = _trim(getUsername(state));
      const contactNumber = getPhone(state);
      if (!addressId) {
        await dispatch(appActionCreators.updateDeliveryDetails({ username: contactName, phone: contactNumber }));
        return;
      }

      const updatedAddress = await updateAddress({ consumerId, addressId, contactName, contactNumber });

      await dispatch(
        appActionCreators.updateDeliveryDetails({
          username: updatedAddress.contactName,
          phone: updatedAddress.contactNumber,
        })
      );

      addressListActions.updateAddress(updatedAddress);
    } catch (error) {
      console.error(`Ordering Customer updateContactDetail: ${error.message}`);
    }
  }
);

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
  extraReducers: {
    [updateContactDetail.pending.type]: state => {
      state.updateContactDetailResult.status = API_REQUEST_STATUS.PENDING;
    },

    [updateContactDetail.fulfilled.type]: state => {
      state.updateContactDetailResult.status = API_REQUEST_STATUS.FULFILLED;
      state.updateContactDetailResult.error = null;
    },

    [updateContactDetail.rejected.type]: (state, action) => {
      state.updateContactDetailResult.status = API_REQUEST_STATUS.REJECTED;
      state.updateContactDetailResult.error = action.error;
    },
  },
});

export default reducer;
