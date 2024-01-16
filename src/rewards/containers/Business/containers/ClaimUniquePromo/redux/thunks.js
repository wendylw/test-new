import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { setCookieVariable } from '../../../../../../common/utils';
import { REFERRER_SOURCE_TYPES, PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import { loginUserByBeepApp, loginUserByTngMiniProgram } from '../../../../../../redux/modules/user/thunks';
import { getIsWebview, getIsTNGMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { postClaimUniquePromo } from './api-request';
import { getUniquePromoRewardsSetId } from './selectors';

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

export const claimPromotionClicked = createAsyncThunk(
  'rewards/business/claimUniquePromo/claimPromotionClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const isTNGMiniProgram = getIsTNGMiniProgram(state);
    const search = getLocationSearch(state);

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    } else if (isTNGMiniProgram) {
      await dispatch(loginUserByTngMiniProgram());
    } else {
      setCookieVariable('__jm_source', REFERRER_SOURCE_TYPES.LOGIN);
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

      return;
    }

    const isLogin = getIsLogin(getState());

    if (isLogin) {
      dispatch(claimUniquePromo());
    }
  }
);
