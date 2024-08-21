import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { goBack as nativeGoBack, showCompleteProfilePageAsync } from '../../../../../../utils/native-methods';
import CleverTap from '../../../../../../utils/clevertap';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getConsumerId, getIsLogin, getIsUserProfileIncomplete } from '../../../../../../redux/modules/user/selectors';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { fetchPointsRewardList, claimPointsReward } from '../../../redux/common/thunks';

export const showWebProfileForm = createAsyncThunk('rewards/business/pointsRewards/showWebProfileForm', async () => {});

export const hideWebProfileForm = createAsyncThunk('rewards/business/pointsRewards/hideWebProfileForm', async () => {});

export const showProfileForm = createAsyncThunk(
  'rewards/business/pointsRewards/showProfileForm',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      await showCompleteProfilePageAsync({ hideSkipButton: true });
      return;
    }

    await dispatch(showWebProfileForm());
  }
);

export const claimPointsRewardAndRefreshRewardsList = createAsyncThunk(
  'rewards/business/pointsRewards/claimPointsRewardAndRefreshRewardsList',
  async (id, { dispatch, getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);

    await dispatch(claimPointsReward({ consumerId, id }));
    dispatch(fetchPointsRewardList(consumerId));
    dispatch(fetchCustomerInfo(business));
  }
);

export const pointsClaimRewardButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewards/pointsClaimRewardButtonClicked',
  async ({ id, status, type, costOfPoints }, { dispatch, getState }) => {
    if (status) {
      CleverTap.pushEvent('Get Rewards Page - Spend Points Modal - Click Confirm', {
        type,
        costOfPoints,
      });

      const state = getState();
      const isUserProfileIncomplete = getIsUserProfileIncomplete(state);

      if (isUserProfileIncomplete) {
        dispatch(showProfileForm());

        return;
      }
      dispatch(claimPointsRewardAndRefreshRewardsList(id));
    } else {
      CleverTap.pushEvent('Get Rewards Page - Spend Points Modal - Click Cancel', {
        type,
        costOfPoints,
      });
    }
  }
);

export const skipProfileButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewards/skipProfileButtonClicked',
  async (id, { dispatch }) => {
    dispatch(hideWebProfileForm());
    dispatch(claimPointsRewardAndRefreshRewardsList(id));
  }
);

export const saveProfileButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewards/saveProfileButtonClicked',
  async (id, { dispatch }) => {
    dispatch(hideWebProfileForm());
    dispatch(claimPointsRewardAndRefreshRewardsList(id));
  }
);

export const mounted = createAsyncThunk('rewards/business/pointsRewards/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('Get Rewards Page - View Page');

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

  if (isLogin) {
    const consumerId = getConsumerId(getState());

    dispatch(fetchMerchantInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchPointsRewardList(consumerId));
  }
});

export const backButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewards/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('Get Rewards Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
