import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import {
  getIsAlipayMiniProgram,
  getIsWebview,
  getLocationSearch,
  getSource,
  getBusiness,
} from '../../../../../redux/modules/common/selectors';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import Growthbook from '../../../../../../utils/growthbook';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getMerchantCountry } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { joinMembership } from '../../../../../../redux/modules/membership/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { getHasUserJoinedMerchantMembership } from '../../../../../redux/modules/customer/selectors';
import { getShouldShowProfileForm } from './selectors';
import { PATH_NAME_MAPPING, REFERRER_SOURCE_TYPES } from '../../../../../../common/utils/constants';
import { getCookieVariable, setCookieVariable, removeCookieVariable } from '../../../../../../common/utils';
import logger from '../../../../../../utils/monitoring/logger';

export const showProfileForm = createAsyncThunk('rewards/business/membershipForm/showProfileForm', async () => {});

export const hideProfileForm = createAsyncThunk('rewards/business/membershipForm/hideProfileForm', async () => {});

export const joinBusinessMembership = createAsyncThunk(
  'rewards/business/membershipForm/joinBusinessMembership',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getBusiness(state);
    const source = getSource(state);
    const consumerId = getConsumerId(state);

    await dispatch(joinMembership({ business, source, consumerId }));
    await dispatch(fetchCustomerInfo(business));
  }
);

export const skipProfileButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/skipProfileButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideProfileForm());
    await dispatch(joinBusinessMembership());
  }
);

export const saveProfileButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/saveProfileButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideProfileForm());
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

    const hasUserJoinedMerchantMembership = getHasUserJoinedMerchantMembership(getState());

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

    await dispatch(fetchMerchantInfo(business));

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
      return;
    }

    dispatch(fetchCustomerInfo(business));
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
    const isLogin = getIsLogin(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

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
