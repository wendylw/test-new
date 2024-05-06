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
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import {
  getMerchantBusiness,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getCustomerCustomerId } from '../../../../../redux/modules/customer/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';

import { getCashbackHistoryList, getStoreCreditsHistoryList } from './api-request';

export const fetchCashbackHistoryList = createAsyncThunk(
  'rewards/business/cashbackCreditsHistory/fetchCashbackHistoryList',
  async (customerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getCashbackHistoryList({ customerId, business, rewardType: 'cashback' });

    return result;
  }
);

export const fetchStoreCreditsHistoryList = createAsyncThunk(
  'rewards/business/cashbackCreditsHistory/fetchStoreCreditsHistoryList',
  async (customerId, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const result = await getStoreCreditsHistoryList({ customerId, business });

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/cashbackCreditsHistory/mounted',
  async (_, { dispatch, getState }) => {
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
    const isNotLoginInWeb = getIsNotLoginInWeb(getState());

    if (isNotLoginInWeb) {
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

      return;
    }

    if (isLogin) {
      await dispatch(fetchMerchantInfo(business));
      await dispatch(fetchCustomerInfo(business));

      const isMerchantEnabledStoreCredits = getIsMerchantEnabledStoreCredits(getState());
      const customerId = getCustomerCustomerId(getState());

      isMerchantEnabledStoreCredits
        ? dispatch(fetchStoreCreditsHistoryList(customerId))
        : dispatch(fetchCashbackHistoryList(customerId));
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/cashbackCreditsHistory/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
