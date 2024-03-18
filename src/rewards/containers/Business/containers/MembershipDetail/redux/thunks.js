import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { getClient } from '../../../../../../common/utils';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { getIsWebview, getIsAlipayMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { getUniquePromoList, getPointsRewardList, postClaimedPointsReward } from './api-request';

export const fetchUniquePromoList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPromoList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);

export const fetchPointsRewardList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPointsRewardList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await getPointsRewardList({ consumerId, business });

    return result;
  }
);

export const claimPointsReward = createAsyncThunk(
  'rewards/business/memberDetail/claimPointsReward',
  async ({ id, type }, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await postClaimedPointsReward({ consumerId, business, id, type });

    return result;
  }
);

export const mounted = createAsyncThunk('rewards/business/memberDetail/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('Membership Details Page - View Page', {
    'account name': business,
    source: getClient(),
  });

  await dispatch(initUserInfo());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isAlipayMiniProgram) {
    await dispatch(loginUserByAlipayMiniProgram());
  }

  const isLogin = getIsLogin(getState());
  const isNotLoginInWeb = !isLogin && !isWebview && !isAlipayMiniProgram;

  if (isNotLoginInWeb) {
    dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

    return;
  }

  if (isLogin) {
    dispatch(fetchMerchantInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchUniquePromoList());
    dispatch(fetchPointsRewardList());
  }
});

export const backButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const pointsClaimRewardButtonClick = createAsyncThunk(
  'rewards/business/memberDetail/pointsClaimRewardButtonClick',
  async ({ id, type }, { dispatch }) => {
    await dispatch(claimPointsReward(id, type));
    dispatch(fetchPointsRewardList());
  }
);
