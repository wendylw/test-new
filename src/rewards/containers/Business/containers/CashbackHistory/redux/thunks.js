import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import Growthbook from '../../../../../../utils/growthbook';
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
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { getIsWebview, getIsAlipayMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { getCashbackHistoryListPage, getCashbackHistoryListLimit, getIsCashbackHistoryListEnded } from './selectors';

import { getCashbackHistoryList } from './api-request';

export const fetchCashbackHistoryList = createAsyncThunk(
  'rewards/business/pointsHistory/fetchCashbackHistoryList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const page = getCashbackHistoryListPage(state);
    const limit = getCashbackHistoryListLimit(state);
    const result = await getCashbackHistoryList({ consumerId, business, page, limit });

    return result.data;
  }
);

export const queryFetchCashbackHistoryList = createAsyncThunk(
  'rewards/business/pointsHistory/queryFetchCashbackHistoryList',
  async (_, { dispatch, getState }) => {
    await dispatch(fetchCashbackHistoryList());

    const end = getIsCashbackHistoryListEnded(getState());

    if (!end) {
      dispatch(queryFetchCashbackHistoryList());
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
    dispatch(queryFetchCashbackHistoryList());
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
