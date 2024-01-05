import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { postUserMembership, getBusinessInfo, getConsumerCustomerBusinessInfo } from './api-request';
import { goBack } from '../../../../../../utils/native-methods';
import { getIsAliMiniProgram, getIsWebview, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import Growthbook from '../../../../../../utils/growthbook';
import {
  fetchUserLoginStatus,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { PATH_NAME_MAPPING, REFERRER_SOURCE_TYPES } from '../../../../../../common/utils/constants';
import {
  getQueryString,
  getCookieVariable,
  setCookieVariable,
  removeCookieVariable,
} from '../../../../../../common/utils';
import { alert } from '../../../../../../common/utils/feedback';

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

export const joinMembership = createAsyncThunk(
  'rewards/business/membershipForm/joinMembership',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getQueryString('business');
    const source = getQueryString('source');

    try {
      await postUserMembership({ consumerId, business, source });
    } catch (error) {
      alert(i18next.t('UnknownErrorDescription'), {
        title: i18next.t('UnknownErrorTitle'),
      });
    }
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
      await dispatch(joinMembership());
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
    const isAliMiniProgram = getIsAliMiniProgram(state);
    const search = getLocationSearch(state);

    if (isLogin) {
      await dispatch(joinMembership());
      return;
    }

    if (!(isAliMiniProgram || isWebview)) {
      setCookieVariable('__jm_source', REFERRER_SOURCE_TYPES.LOGIN);
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));
      return;
    }

    // Force a login for Beep app & Beep TnG MP
    if (isAliMiniProgram) {
      await dispatch(loginUserByAlipayMiniProgram());
    }

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (getIsLogin(getState())) {
      await dispatch(joinMembership());
    }
  }
);
