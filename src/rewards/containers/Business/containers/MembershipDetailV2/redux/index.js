import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import {
  showWebProfileForm,
  hideWebProfileForm,
  showWebSkipButton,
  hideWebSkipButton,
  fetchMerchantBirthdayCampaign,
} from './thunks';

const initialState = {
  isCashbackPromptDrawerShow: false,
  isStoreCreditsPromptDrawerShow: false,
  fetchUniquePromoListBannersLimit: 2,
  loadMerchantBirthdayCampaignRequest: {
    data: null,
    status: null,
    error: null,
  },
  profileModalRequest: {
    show: false,
    showSkipButton: false,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  reducers: {
    cashbackPromptDrawerShown: state => {
      state.isCashbackPromptDrawerShow = true;
    },
    cashbackPromptDrawerHidden: state => {
      state.isCashbackPromptDrawerShow = false;
    },
    storeCreditsPromptDrawerShown: state => {
      state.isStoreCreditsPromptDrawerShow = true;
    },
    storeCreditsPromptDrawerHidden: state => {
      state.isStoreCreditsPromptDrawerShow = false;
    },
  },
  extraReducers: {
    [showWebProfileForm.fulfilled.type]: state => {
      state.profileModalRequest.show = true;
    },
    [hideWebProfileForm.fulfilled.type]: state => {
      state.profileModalRequest.show = false;
    },
    [showWebSkipButton.fulfilled.type]: state => {
      state.profileModalRequest.showSkipButton = true;
    },
    [hideWebSkipButton.fulfilled.type]: state => {
      state.profileModalRequest.showSkipButton = false;
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
