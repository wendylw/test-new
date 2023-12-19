import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { getBusinessInfo, getConsumerCustomerBusinessInfo } from './api-request';
import { goBack } from '../../../../../../utils/native-methods';
import { getIsTNGMiniProgram, getIsWebview, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import Growthbook from '../../../../../../utils/growthbook';
import {
  fetchUserLoginStatus,
  loginUserByBeepApp,
  loginUserByTngMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { joinMembership } from '../../../redux/common/thunks';
import { PATH_NAME_MAPPING, REFERRER_SOURCE_TYPES } from '../../../../../../common/utils/constants';
import {
  getQueryString,
  getCookieVariable,
  setCookieVariable,
  removeCookieVariable,
} from '../../../../../../common/utils';

export const fetchBusinessInfo = createAsyncThunk(
  'rewards/business/membershipForm/fetchBusinessInfo',
  async business => {
    const result = await getBusinessInfo(business);
    const { country } = result || {};

    Growthbook.patchAttributes({ country });

    return result;
  }
);

export const fetchCustomerMembershipInfo = createAsyncThunk(
  'rewards/business/membershipForm/fetchCustomerMembershipInfo',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getQueryString('business');

    return getConsumerCustomerBusinessInfo({ consumerId, business });
  }
);

export const goToMembershipDetail = createAsyncThunk(
  'rewards/business/membershipForm/goToMembershipDetail',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const search = getLocationSearch(state);

    dispatch(push(`${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}${search}`));
  }
);

export const becomeAMember = createAsyncThunk(
  'rewards/business/membershipForm/becomeAMember',
  async (_, { dispatch }) => {
    await dispatch(joinMembership()).unwrap();
    await dispatch(goToMembershipDetail());
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/membershipForm/mounted',
  async (_, { dispatch, getState }) => {
    const business = getQueryString('business');

    Growthbook.patchAttributes({ business });
    await dispatch(fetchBusinessInfo(business));
    await dispatch(fetchUserLoginStatus());

    const isLogin = getIsLogin(getState());

    if (!isLogin) {
      return;
    }

    const from = getCookieVariable('__jm_source');
    removeCookieVariable('__jm_source');

    if (from === REFERRER_SOURCE_TYPES.LOGIN) {
      await dispatch(becomeAMember());
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/backButtonClicked',
  async (_, { dispatch }) => dispatch(goBack())
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
    const isTNGMiniProgram = getIsTNGMiniProgram(state);
    const search = getLocationSearch(state);

    if (isLogin) {
      await dispatch(becomeAMember());
      return;
    }

    if (!(isTNGMiniProgram || isWebview)) {
      setCookieVariable('__jm_source', REFERRER_SOURCE_TYPES.LOGIN);
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));
      return;
    }

    // Force a login for Beep app & Beep TnG MP
    if (isTNGMiniProgram) {
      await dispatch(loginUserByTngMiniProgram());
    }

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (getIsLogin(getState())) {
      await dispatch(becomeAMember());
    }
  }
);
