/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActionCreators, getUserConsumerId, getDeliveryDetails } from '../../../../../redux/modules/app';
import { upsertAddress } from '../../../redux/common/api-request';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { actions as commonActions } from '../../../redux/common/index';

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
      const contactName = getUsername(state);
      const contactNumber = getPhone(state);
      if (!addressId) {
        await dispatch(appActionCreators.updateDeliveryDetails({ username: contactName, phone: contactNumber }));
        return;
      }

      const updatedAddress = await upsertAddress({ consumerId, addressId, contactName, contactNumber });

      await dispatch(
        appActionCreators.updateDeliveryDetails({
          username: updatedAddress.contactName,
          phone: updatedAddress.contactNumber,
        })
      );

      commonActions.updateAddress(updatedAddress);
    } catch (error) {
      console.log(error);
      throw error;
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
