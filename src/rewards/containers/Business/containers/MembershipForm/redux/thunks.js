import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack, showCompleteProfilePageAsync } from '../../../../../../utils/native-methods';
import { getCookieVariable, setCookieVariable, removeCookieVariable, getClient } from '../../../../../../common/utils';
import { PATH_NAME_MAPPING, REFERRER_SOURCE_TYPES } from '../../../../../../common/utils/constants';
import logger from '../../../../../../utils/monitoring/logger';
import CleverTap from '../../../../../../utils/clevertap';
import Growthbook from '../../../../../../utils/growthbook';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getMerchantBusiness, getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { joinMembership, fetchMembershipsInfo } from '../../../../../../redux/modules/membership/thunks';
import {
  getIsAlipayMiniProgram,
  getIsWebview,
  getLocationSearch,
  getSource,
  getBusiness,
} from '../../../../../redux/modules/common/selectors';
import {
  getReceiptNumber,
  getChannel,
  getStoreId,
  getIsRequestOrderRewardsEnabled,
} from '../../../redux/common/selectors';
import { claimOrderRewards } from '../../../redux/common/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { getHasUserJoinedMerchantMembership } from '../../../../../redux/modules/customer/selectors';
import { getShouldShowProfileForm, getIsClaimedOrderRewardsEnabled } from './selectors';
import { getOrderRewards } from './api-request';

export const showWebProfileForm = createAsyncThunk(
  'rewards/business/membershipForm/showWebProfileForm',
  async () => {}
);

export const hideWebProfileForm = createAsyncThunk(
  'rewards/business/membershipForm/hideWebProfileForm',
  async () => {}
);

export const loadCustomerInfo = createAsyncThunk(
  'rewards/business/membershipForm/loadCustomerInfo',
  async (_, { dispatch, getState }) => {
    const business = getBusiness(getState());
    await dispatch(fetchCustomerInfo(business));
  }
);

export const loadOrderRewards = createAsyncThunk(
  'rewards/business/membershipForm/loadOrderRewards',
  async (_, { getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const receiptNumber = getReceiptNumber(state);
    const channel = getChannel(state);

    const result = await getOrderRewards({ receiptNumber, business, channel });

    return result;
  }
);

export const joinBusinessMembership = createAsyncThunk(
  'rewards/business/membershipForm/joinBusinessMembership',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const source = getSource(state);
    const consumerId = getConsumerId(state);
    const storeId = getStoreId(state);

    await dispatch(joinMembership({ business, source, consumerId, storeId }));
    await dispatch(fetchCustomerInfo(business));
  }
);

export const showNativeProfileForm = createAsyncThunk(
  'rewards/business/membershipForm/showNativeProfileForm',
  async (_, { dispatch }) => {
    await showCompleteProfilePageAsync();
    await dispatch(joinBusinessMembership());
  }
);

export const showProfileForm = createAsyncThunk(
  'rewards/business/membershipForm/showProfileForm',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      await dispatch(showNativeProfileForm());
      return;
    }

    await dispatch(showWebProfileForm());
  }
);

export const skipProfileButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/skipProfileButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideWebProfileForm());
    await dispatch(joinBusinessMembership());
  }
);

export const saveProfileButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/saveProfileButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideWebProfileForm());
    await dispatch(joinBusinessMembership());
  }
);

export const goToMembershipDetail = createAsyncThunk(
  'rewards/business/membershipForm/goToMembershipDetail',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const search = getLocationSearch(state);

    dispatch(
      replace(
        `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}${search}`
      )
    );
  }
);

export const continueJoinMembership = createAsyncThunk(
  'rewards/business/membershipForm/continueJoinMembership',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);

    await dispatch(fetchCustomerInfo(business));

    const isClaimedOrderRewardsEnabled = getIsClaimedOrderRewardsEnabled(getState());
    const hasUserJoinedMerchantMembership = getHasUserJoinedMerchantMembership(getState());

    // This request needs to be placed before the return of hasUserJoinedMerchantMembership;
    // customer has already joined the membership, still complete claim order rewards according to the current design.
    isClaimedOrderRewardsEnabled && (await dispatch(claimOrderRewards()));

    if (hasUserJoinedMerchantMembership) {
      // NOTE: this case has been handled in MembershipFormProxy useEffect. No need to do any manual redirect here.
      return;
    }

    const shouldShowProfileForm = getShouldShowProfileForm(getState());

    try {
      if (shouldShowProfileForm) {
        await dispatch(showProfileForm());
        throw new Error('Incomplete user profile');
      }

      await dispatch(joinBusinessMembership());
    } catch (error) {
      logger.error('Rewards_Business_JoinMembershipFailed', { message: error?.message });
      throw error;
    }
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/membershipForm/mounted',
  async (_, { dispatch, getState }) => {
    const business = getBusiness(getState());

    dispatch(fetchMembershipsInfo(business));
    await dispatch(fetchMerchantInfo(business));

    // isRequestOrderRewardsEnabled must after fetch merchant info
    // Needs to determine whether the merchant has enabled points or cashback.
    const isRequestOrderRewardsEnabled = getIsRequestOrderRewardsEnabled(getState());

    if (isRequestOrderRewardsEnabled) {
      dispatch(loadOrderRewards());
    }

    const country = getMerchantCountry(getState());

    Growthbook.patchAttributes({
      country,
      business,
    });

    await dispatch(initUserInfo());

    const isLogin = getIsLogin(getState());

    if (!isLogin) {
      return;
    }

    const from = getCookieVariable('__jm_source');
    removeCookieVariable('__jm_source');

    if (from === REFERRER_SOURCE_TYPES.LOGIN) {
      await dispatch(continueJoinMembership());
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const retryButtonClicked = createAsyncThunk('rewards/business/membershipForm/retryButtonClicked', async () =>
  window.location.reload()
);

export const joinNowButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/joinNowButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isLogin = getIsLogin(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

    CleverTap.pushEvent('Join Membership Page - Click Join Now', {
      'account name': merchantBusiness,
      source: getClient(),
    });

    if (isLogin) {
      await dispatch(continueJoinMembership());
      return;
    }

    if (!(isAlipayMiniProgram || isWebview)) {
      setCookieVariable('__jm_source', REFERRER_SOURCE_TYPES.LOGIN);
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));
      return;
    }

    // Force a login for Beep app & Beep TnG MP
    if (isAlipayMiniProgram) {
      await dispatch(loginUserByAlipayMiniProgram());
    }

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (getIsLogin(getState())) {
      await dispatch(continueJoinMembership());
    }
  }
);
