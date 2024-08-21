import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import Growthbook from '../../../../../../utils/growthbook';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getCustomerCustomerId } from '../../../../../redux/modules/customer/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';

import { getPointsHistoryList } from './api-request';

export const fetchPointsHistoryList = createAsyncThunk(
  'rewards/business/pointsHistory/fetchPointsHistoryList',
  async (customerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getPointsHistoryList({ customerId, business });

    return result;
  }
);

export const mounted = createAsyncThunk('rewards/business/pointsHistory/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  Growthbook.patchAttributes({
    business,
  });

  CleverTap.pushEvent('Points Details Page - View Page', { 'account name': business });

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
    dispatch(fetchMerchantInfo(business));
    await dispatch(fetchCustomerInfo(business));

    const customerId = getCustomerCustomerId(getState());

    dispatch(fetchPointsHistoryList(customerId));
  }
});

export const backButtonClicked = createAsyncThunk(
  'rewards/business/pointsHistory/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
