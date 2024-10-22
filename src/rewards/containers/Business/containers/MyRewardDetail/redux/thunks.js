import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMyRewardId, getMyRewardUniquePromotionId } from './selectors';
import { getUniquePromotionDetail } from './api-request';

export const fetchMyRewardDetail = createAsyncThunk(
  'rewards/business/myRewardDetail/fetchMyRewardDetail',
  async (_, { getState }) => {
    const state = getState();
    const id = getMyRewardId(state);
    const uniquePromotionId = getMyRewardUniquePromotionId(state);

    const result = await getUniquePromotionDetail({ id, uniquePromotionId });

    return result;
  }
);
