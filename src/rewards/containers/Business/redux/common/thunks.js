import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  postSharingConsumerInfoToMerchant,
  getUniquePromoList,
  getUniquePromoListBanners,
  getPointsRewardList,
  postClaimedPointsReward,
  getCustomizeRewardsSettings,
} from './api-request';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getBusiness } from '../../../../redux/modules/common/selectors';

export const confirmToShareConsumerInfo = createAsyncThunk(
  'rewards/business/common/confirmToShareConsumerInfo',
  async (requestId, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const result = await postSharingConsumerInfoToMerchant({ requestId, business: merchantBusiness });

    return result;
  }
);

export const fetchUniquePromoList = createAsyncThunk(
  'rewards/business/common/fetchPromoList',
  async (consumerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);

export const fetchUniquePromoListBanners = createAsyncThunk(
  'rewards/business/common/fetchUniquePromoListBanners',
  async ({ consumerId, limit }, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoListBanners({ consumerId, business, limit });

    return result;
  }
);

export const fetchPointsRewardList = createAsyncThunk(
  'rewards/business/common/fetchPointsRewardList',
  async (consumerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getPointsRewardList({ consumerId, business });

    return result;
  }
);

export const claimPointsReward = createAsyncThunk(
  'rewards/business/common/claimPointsReward',
  async ({ consumerId, id }, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await postClaimedPointsReward({ consumerId, business, id });

    return result;
  }
);

export const fetchCustomizeRewardsSettings = createAsyncThunk(
  'rewards/business/common/fetchCustomizeRewardsSettings',
  async (_, { getState }) => {
    const state = getState();
    const business = getBusiness(state);

    const result = await getCustomizeRewardsSettings(business);

    return result;
  }
);
