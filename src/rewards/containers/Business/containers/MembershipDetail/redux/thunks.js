import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import Growthbook from '../../../../../../utils/growthbook';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { getClient } from '../../../../../../common/utils';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack, showCompleteProfilePageAsync } from '../../../../../../utils/native-methods';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId, getIsUserProfileIncomplete } from '../../../../../../redux/modules/user/selectors';
import { fetchMembershipsInfo } from '../../../../../../redux/modules/membership/thunks';
import { getIsWebview, getIsAlipayMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { fetchUniquePromoList } from '../../../redux/common/thunks';

import { getPointsRewardList, postClaimedPointsReward } from './api-request';

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
  async (id, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await postClaimedPointsReward({ consumerId, business, id });

    return result;
  }
);

export const mounted = createAsyncThunk('rewards/business/memberDetail/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  Growthbook.patchAttributes({
    business,
  });

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
    const consumerId = getConsumerId(getState());

    dispatch(fetchMerchantInfo(business));
    dispatch(fetchMembershipsInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchUniquePromoList(consumerId));
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

export const showWebProfileForm = createAsyncThunk('rewards/business/memberDetail/showWebProfileForm', async () => {});

export const hideWebProfileForm = createAsyncThunk('rewards/business/memberDetail/hideWebProfileForm', async () => {});

export const showProfileForm = createAsyncThunk(
  'rewards/business/memberDetail/showProfileForm',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      await showCompleteProfilePageAsync();
      return;
    }

    await dispatch(showWebProfileForm());
  }
);

export const claimPointsRewardAndRefreshRewardsList = createAsyncThunk(
  'rewards/business/memberDetail/claimPointsRewardAndRefreshRewardsList',
  async (id, { dispatch, getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);

    await dispatch(claimPointsReward(id));
    dispatch(fetchPointsRewardList());
    dispatch(fetchCustomerInfo(business));
  }
);

export const pointsClaimRewardButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/pointsClaimRewardButtonClicked',
  async (id, { dispatch, getState }) => {
    const state = getState();
    const isUserProfileIncomplete = getIsUserProfileIncomplete(state);

    if (isUserProfileIncomplete) {
      dispatch(showProfileForm());

      return;
    }

    dispatch(claimPointsRewardAndRefreshRewardsList(id));
  }
);

export const skipProfileButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/skipProfileButtonClicked',
  async (id, { dispatch }) => {
    dispatch(hideWebProfileForm());
    dispatch(claimPointsRewardAndRefreshRewardsList(id));
  }
);

export const saveProfileButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/saveProfileButtonClicked',
  async (id, { dispatch }) => {
    dispatch(hideWebProfileForm());
    dispatch(claimPointsRewardAndRefreshRewardsList(id));
  }
);
