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
import { UNIQUE_PROMO_BANNER_LIST_LIMIT } from '../utils/constants';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMembershipsInfo } from '../../../../../../redux/modules/membership/thunks';
import { claimOrderRewards } from '../../../../../../redux/modules/transaction/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
  getSource,
} from '../../../../../redux/modules/common/selectors';
import {
  getReceiptNumber,
  getChannel,
  getIsClaimedOrderRewardsEnabled,
  getStoreId,
} from '../../../redux/common/selectors';
import { fetchUniquePromoList, fetchUniquePromoListBanners, fetchPointsRewardList } from '../../../redux/common/thunks';
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
    const isClaimedOrderRewardsEnabled = getIsClaimedOrderRewardsEnabled(getState());
    const receiptNumber = getReceiptNumber(state);
    const channel = getChannel(state);
    const source = getSource(state);
    const storeId = getStoreId(state);

    dispatch(fetchUniquePromoListBanners({ consumerId, limit: UNIQUE_PROMO_BANNER_LIST_LIMIT }));
    dispatch(fetchPointsRewardList(consumerId));
    dispatch(fetchUniquePromoList(consumerId));

    if (isClaimedOrderRewardsEnabled) {
      await dispatch(claimOrderRewards({ business, receiptNumber, channel, source, storeId }));
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
