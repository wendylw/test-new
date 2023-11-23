import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { postUserMembership, getBusinessInfo, getConsumerCustomerBusinessInfo } from './api-request';
import { goBack } from '../../../../../../utils/native-methods';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import Growthbook from '../../../../../../utils/growthbook';
import { fetchUserLoginStatus } from '../../../../../../redux/modules/user/thunks';
import { getQueryString } from '../../../../../../common/utils';
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
  async (business, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);

    return getConsumerCustomerBusinessInfo({ consumerId, business });
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

    if (isLogin) {
      await dispatch(fetchCustomerMembershipInfo(business));
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

export const joinNowButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/joinNowButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const isLogin = getIsLogin(state);

    if (isLogin) {
      await dispatch(joinMembership());
    }
  }
);
