import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import Growthbook from '../../../../../../utils/growthbook';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { getClient } from '../../../../../../common/utils';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { REWARD_TYPE } from '../utils/constants';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import {
  getMerchantBusiness,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { getIsWebview, getIsAlipayMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';

import { getCashbackCreditsHistoryList } from './api-request';

export const fetchCashbackCreditsHistoryList = createAsyncThunk(
  'rewards/business/pointsHistory/fetchCashbackCreditsHistoryList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const isMerchantEnabledStoreCredits = getIsMerchantEnabledStoreCredits(state);
    const rewardType = isMerchantEnabledStoreCredits ? REWARD_TYPE.STORE_CREDITS : REWARD_TYPE.CASHBACK;
    const result = await getCashbackCreditsHistoryList({ consumerId, business, rewardType });

    return result.data;
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

  CleverTap.pushEvent('Cashback Credits Details Page - View Page', {
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
    await dispatch(fetchMerchantInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchCashbackCreditsHistoryList());
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
