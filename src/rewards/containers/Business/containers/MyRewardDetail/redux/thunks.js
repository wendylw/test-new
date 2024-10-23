import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
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

export const backButtonClicked = createAsyncThunk(
  'rewards/business/myRewardDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('My Rewards Detail Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
