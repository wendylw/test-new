import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';
import { getPointsRewardUniqueRewardSettingId } from './selectors';
import { getPointsRewardDetail } from './api-request';

export const showWebProfileForm = createAsyncThunk(
  'rewards/business/pointsRewardDetail/showWebProfileForm',
  async () => {}
);

export const hideWebProfileForm = createAsyncThunk(
  'rewards/business/pointsRewardDetail/hideWebProfileForm',
  async () => {}
);

export const fetchPointsRewardDetail = createAsyncThunk(
  'rewards/business/pointsRewardDetail/fetchPointsRewardDetail',
  async (_, { getState }) => {
    const state = getState();
    const rewardSettingId = getPointsRewardUniqueRewardSettingId(state);

    const result = await getPointsRewardDetail(rewardSettingId);

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/pointsRewardDetail/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

    CleverTap.pushEvent('Get Rewards Details Page - View Page');

    await dispatch(initUserInfo());

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (isAlipayMiniProgram) {
      await dispatch(loginUserByAlipayMiniProgram());
    }

    const isLogin = getIsLogin(getState());
    const isNotLoginInWeb = getIsNotLoginInWeb(getState());

    if (isNotLoginInWeb) {
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

      return;
    }

    dispatch(fetchMerchantInfo(merchantBusiness));

    if (isLogin) {
      dispatch(fetchPointsRewardDetail());
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewardDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('Get Rewards Details Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
