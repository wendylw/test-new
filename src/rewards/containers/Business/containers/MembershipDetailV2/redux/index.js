import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import {
  showWebProfileForm,
  hideWebProfileForm,
  showWebSkipButton,
  hideWebSkipButton,
  fetchMerchantBirthdayCampaign,
  setPointRewardSelectedId,
  clearPointRewardSelectedId,
  setProfileSource,
  clearProfileSource,
} from './thunks';

const initialState = {
  isUseCashbackPromptDrawerShow: false,
  isUseStoreCreditsPromptDrawerShow: false,
  fetchUniquePromoListBannersLimit: 2,
  loadMerchantBirthdayCampaignRequest: {
    data: null,
    status: null,
    error: null,
  },
  profileModalRequest: {
    show: false,
    showSkipButton: false,
    source: null,
  },
  pointsRewardSelectedId: null,
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/membershipDetail',
  initialState,
  reducers: {
    useCashbackPromptDrawerShown: state => {
      state.isUseCashbackPromptDrawerShow = true;
    },
    useCashbackPromptDrawerHidden: state => {
      state.isUseCashbackPromptDrawerShow = false;
    },
    useStoreCreditsPromptDrawerShown: state => {
      state.isUseStoreCreditsPromptDrawerShow = true;
    },
    useStoreCreditsPromptDrawerHidden: state => {
      state.isUseStoreCreditsPromptDrawerShow = false;
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
    [setProfileSource.fulfilled.type]: (state, { payload }) => {
      state.profileModalRequest.source = payload;
    },
    [clearProfileSource.fulfilled.type]: state => {
      state.profileModalRequest.source = null;
    },
    [setPointRewardSelectedId.fulfilled.type]: (state, { payload }) => {
      state.pointsRewardSelectedId = payload;
    },
    [clearPointRewardSelectedId.fulfilled.type]: state => {
      state.pointsRewardSelectedId = null;
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
