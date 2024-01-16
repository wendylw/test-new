import { createAsyncThunk } from '@reduxjs/toolkit';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import { initUserInfo } from '../../../../../../redux/modules/user/thunks';
import { postClaimUniquePromo } from './api-request';

export const claimUniquePromo = createAsyncThunk(
  'rewards/business/claimUniquePromo/claimUniquePromo',
  async (_, { getState }) => {
    const state = getState();
    const rewardsSetId = getUniquePromoRewardsSetId(state);
    const result = await postClaimUniquePromo({
      id: rewardsSetId,
    });

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/claimUniquePromo/mounted',
  async (_, { getState, dispatch }) => {
    await dispatch(initUserInfo());

    const isLogin = getIsLogin(getState());

    if (!isLogin) {
      dispatch(claimUniquePromo());
    }
  }
);
