/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../utils/constants';
import { getBusinessDefaultValue } from './utils';
import { fetchMerchantInfo } from './thunks';

const initialState = {
  business: getBusinessDefaultValue(),
  loadMerchantRequest: {
    data: {
      business: getBusinessDefaultValue(),
      logo: null,
      displayName: '',
      country: null,
      locale: null,
      currency: null,
      enableDelivery: false,
      isQROrderingEnabled: false,
      enableCashback: false,
    },
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'app/merchant',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchMerchantInfo.pending.type]: state => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMerchantRequest.error = null;
    },
    [fetchMerchantInfo.fulfilled.type]: (state, { payload }) => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.SUCCESS;
      state.loadMerchantRequest.data = payload;
    },
    [fetchMerchantInfo.rejected.type]: (state, { error }) => {
      state.loadMerchantRequest.status = API_REQUEST_STATUS.FAILURE;
      state.loadMerchantRequest.error = error;
    },
  },
});

export default reducer;
export { actions };
