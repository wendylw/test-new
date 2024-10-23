import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
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

export const mounted = createAsyncThunk(
  'rewards/business/myRewardDetail/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);

    dispatch(fetchMerchantInfo(merchantBusiness));
    dispatch(fetchMyRewardDetail());
  }
);
