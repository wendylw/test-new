import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { showWebProfileForm, hideWebProfileForm, fetchMerchantBirthdayCampaign } from './thunks';

const initialState = {
  isProfileModalShow: false,
  fetchUniquePromoListBannersLimit: 2,
  loadMerchantBirthdayCampaignRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  extraReducers: {
    [showWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.isProfileModalShow = false;
    },
    [fetchMerchantBirthdayCampaign.pending.type]: state => {
      state.loadMerchantBirthdayCampaignRequest.status = API_REQUEST_STATUS.PENDING;
      state.loadMerchantBirthdayCampaignRequest.error = null;
    },
    [fetchMerchantBirthdayCampaign.fulfilled.type]: (state, { payload }) => {
      state.loadMerchantBirthdayCampaignRequest.data = payload;
      state.loadMerchantBirthdayCampaignRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.loadMerchantBirthdayCampaignRequest.error = null;
    },
    [fetchMerchantBirthdayCampaign.rejected.type]: (state, { error }) => {
      state.loadMerchantBirthdayCampaignRequest.status = API_REQUEST_STATUS.REJECTED;
      state.loadMerchantBirthdayCampaignRequest.error = error;
    },
  },
});

export default reducer;
