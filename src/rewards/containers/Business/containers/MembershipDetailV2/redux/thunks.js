import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import Growthbook from '../../../../../../utils/growthbook';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import {
  goBack as nativeGoBack,
  closeWebView,
  showCompleteProfilePageAsync,
} from '../../../../../../utils/native-methods';
import { SHOW_PROFILE_FROM_POINTS_REWARDS } from '../utils/constants';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId, getIsUserProfileIncomplete } from '../../../../../../redux/modules/user/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMembershipsInfo } from '../../../../../../redux/modules/membership/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';
import { getIsClaimedOrderRewardsEnabled } from '../../../redux/common/selectors';
import {
  fetchUniquePromoList,
  fetchUniquePromoListBanners,
  fetchPointsRewardList,
  claimPointsReward,
  claimOrderRewards,
} from '../../../redux/common/thunks';
import { getFetchUniquePromoListBannersLimit, getShowProfileModalSource, getPointsRewardSelectedId } from './selectors';
import { getMerchantBirthdayCampaign } from './api-request';

export const fetchMerchantBirthdayCampaign = createAsyncThunk(
  'rewards/business/memberDetail/fetchMerchantBirthdayCampaign',
  async (_, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);

    const result = await getMerchantBirthdayCampaign(business);

    return result;
  }
);

export const showWebProfileForm = createAsyncThunk('rewards/business/memberDetail/showWebProfileForm', async () => {});

export const hideWebProfileForm = createAsyncThunk('rewards/business/memberDetail/hideWebProfileForm', async () => {});

export const showWebSkipButton = createAsyncThunk('rewards/business/memberDetail/showWebSkipButton', async () => {});

export const hideWebSkipButton = createAsyncThunk('rewards/business/memberDetail/hideWebSkipButton', async () => {});

export const setProfileSource = createAsyncThunk(
  'rewards/business/memberDetail/setProfileSource',
  async source => source
);

export const clearProfileSource = createAsyncThunk('rewards/business/memberDetail/clearProfileSource', async () => {});

export const setPointRewardSelectedId = createAsyncThunk(
  'rewards/business/memberDetail/setPointRewardSelectedId',
  async id => id
);

export const clearPointRewardSelectedId = createAsyncThunk(
  'rewards/business/memberDetail/clearPointRewardSelectedId',
  async () => {}
);

export const showProfileForm = createAsyncThunk(
  'rewards/business/memberDetail/showProfileForm',
  async ({ hideSkipButton = true, source } = {}, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      await showCompleteProfilePageAsync({ hideSkipButton });
      return;
    }

    await dispatch(showWebProfileForm());
    !hideSkipButton && (await dispatch(showWebSkipButton()));
    source && (await dispatch(setProfileSource(source)));
  }
);

export const hideProfileForm = createAsyncThunk(
  'rewards/business/memberDetail/hideProfileForm',
  async (_, { dispatch }) => {
    await dispatch(hideWebProfileForm());
    await dispatch(hideWebSkipButton());
    await dispatch(clearProfileSource());
  }
);

export const claimPointsRewardAndRefreshRewardsList = createAsyncThunk(
  'rewards/business/memberDetail/claimPointsRewardAndRefreshRewardsList',
  async (id, { dispatch, getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);

    await dispatch(claimPointsReward({ consumerId, id }));
    dispatch(fetchPointsRewardList(consumerId));
    dispatch(fetchCustomerInfo(business));
    dispatch(clearPointRewardSelectedId());
  }
);

export const pointsClaimRewardButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/pointsClaimRewardButtonClicked',
  async ({ id, status, type, costOfPoints }, { dispatch, getState }) => {
    if (status) {
      CleverTap.pushEvent('Membership Details Page - Spend Points Modal - Click Confirm', {
        type,
        costOfPoints,
      });

      const state = getState();
      const isUserProfileIncomplete = getIsUserProfileIncomplete(state);
      const isWebview = getIsWebview(state);

      if (isUserProfileIncomplete) {
        dispatch(setPointRewardSelectedId(id));

        if (isWebview) {
          // native complete profile, claim order points reward immediately
          await showCompleteProfilePageAsync({ hideSkipButton: true });
          dispatch(claimPointsRewardAndRefreshRewardsList(id));
        } else {
          dispatch(showProfileForm({ source: SHOW_PROFILE_FROM_POINTS_REWARDS }));
        }

        return;
      }

      dispatch(claimPointsRewardAndRefreshRewardsList(id));
    } else {
      CleverTap.pushEvent('Membership Details Page - Spend Points Modal - Click Cancel', {
        type,
        costOfPoints,
      });
    }
  }
);

export const skipProfileButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/skipProfileButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const showProfileModalSource = getShowProfileModalSource(state);

    // User wants to claim points to get rewards, Need to complete profile info first.
    // Once the user completes the profile, Continue claiming process.
    if (showProfileModalSource === SHOW_PROFILE_FROM_POINTS_REWARDS) {
      const pointsRewardSelectedId = getPointsRewardSelectedId(getState());

      dispatch(claimPointsRewardAndRefreshRewardsList(pointsRewardSelectedId));
    }
  }
);

export const saveProfileButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/saveProfileButtonClicked',
  async (_, { dispatch, getState }) => {
    const showProfileModalSource = getShowProfileModalSource(getState());

    // User wants to claim points to get rewards, Need to complete profile info first.
    // Once the user completes the profile, Continue claiming process.
    if (showProfileModalSource === SHOW_PROFILE_FROM_POINTS_REWARDS) {
      const pointsRewardSelectedId = getPointsRewardSelectedId(getState());

      dispatch(claimPointsRewardAndRefreshRewardsList(pointsRewardSelectedId));
    }
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

  CleverTap.pushEvent('Membership Details Page - View Page');

  dispatch(fetchMerchantInfo(business));
  dispatch(fetchMembershipsInfo(business));
  dispatch(fetchMerchantBirthdayCampaign());
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
    const fetchUniquePromoListBannersLimit = getFetchUniquePromoListBannersLimit(getState());
    const isClaimedOrderRewardsEnabled = getIsClaimedOrderRewardsEnabled(getState());

    dispatch(fetchUniquePromoListBanners({ consumerId, limit: fetchUniquePromoListBannersLimit }));
    dispatch(fetchPointsRewardList(consumerId));
    dispatch(fetchUniquePromoList(consumerId));

    if (isClaimedOrderRewardsEnabled) {
      await dispatch(claimOrderRewards());
    }

    // customer info must after claim order rewards, maybe customer data will be changed
    dispatch(fetchCustomerInfo(business));
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

export const closeButtonClicked = createAsyncThunk(
  'rewards/business/memberDetail/closeButtonClicked',
  async (_, { dispatch }) => dispatch(closeWebView())
);

export const membershipTierTabClickedForCleverTap = createAsyncThunk(
  'rewards/business/memberDetail/membershipTierTabClickedForCleverTap',
  async tierName => {
    CleverTap.pushEvent(`Membership Details Page - Click ${tierName} Tab`);
  }
);
