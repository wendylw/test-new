import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  postSharingConsumerInfoToMerchant,
  getUniquePromoList,
  getUniquePromoListBanners,
  getPointsRewardList,
  postClaimedPointsReward,
  getOrderRewards,
  postClaimedOrderRewards,
} from './api-request';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { getBusiness, getSource } from '../../../../redux/modules/common/selectors';
import { getReceiptNumber, getChannel, getStoreId } from './selectors';

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

    alert(`${consumerId} claimPointsReward consumerId`);
    alert(`${business} claimPointsReward business`);
    alert(`${id} claimPointsReward id`);

    return result;
  }
);

export const loadOrderRewards = createAsyncThunk(
  'rewards/business/common/loadOrderRewards',
  async (_, { getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const receiptNumber = getReceiptNumber(state);
    const channel = getChannel(state);

    const result = await getOrderRewards({ receiptNumber, business, channel });

    return result;
  }
);

export const claimOrderRewards = createAsyncThunk(
  'rewards/business/common/claimOrderRewards',
  async (_, { getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const receiptNumber = getReceiptNumber(state);
    const channel = getChannel(state);
    const source = getSource(state);
    const storeId = getStoreId(state);

    const result = await postClaimedOrderRewards({ receiptNumber, business, channel, source, storeId });

    return result;
  }
);
