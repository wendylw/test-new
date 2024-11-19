import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { getQueryString, getFilteredQueryString } from '../../../../../../common/utils';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { fetchRewardList } from '../../../../../../redux/modules/rewards/thunks';
import {
  getIsWebview,
  getBusiness,
  getShippingType,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getUserIsLogin,
  getIsNotLoginInWeb,
  actions as appActions,
} from '../../../../../redux/modules/app';
import { getSearchKeyword } from './selectors';

export const updateSearchKeywordByQuery = createAsyncThunk(
  'ordering/rewardList/updateSearchKeywordByQuery',
  async () => {
    const searchKeyword = getQueryString('search');

    return searchKeyword || '';
  }
);

export const clearQuerySearchKeyword = createAsyncThunk(
  'ordering/rewardList/clearQuerySearchKeyword',
  async (_, { dispatch }) => {
    const filteredQuery = getFilteredQueryString('search');

    dispatch(replace(`${PATH_NAME_MAPPING.ORDERING_REWARDS}${filteredQuery}`));
  }
);

export const initSearchSearchKeyword = createAsyncThunk(
  'ordering/rewardList/initSearchSearchKeyword',
  async (_, { dispatch }) => {
    await dispatch(updateSearchKeywordByQuery());
    dispatch(clearQuerySearchKeyword());
  }
);

export const mounted = createAsyncThunk('ordering/rewardList/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getBusiness(state);
  const shippingType = getShippingType(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('My Vouchers & Promos Page - View Page');

  await dispatch(appActions.getLoginStatus());

  if (isWebview) {
    await dispatch(appActions.loginByBeepApp());
  }

  if (isAlipayMiniProgram) {
    await dispatch(appActions.loginByAlipayMiniProgram());
  }

  const isLogin = getUserIsLogin(getState());
  const isNotLoginInWeb = getIsNotLoginInWeb(getState());

  if (isNotLoginInWeb) {
    dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

    return;
  }

  await dispatch(initSearchSearchKeyword());

  const searchKeyword = getSearchKeyword(getState());

  if (isLogin) {
    dispatch(fetchRewardList({ search: searchKeyword, shippingType, merchantName: business }));
  }
});

export const backButtonClicked = createAsyncThunk(
  'ordering/rewardList/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('My Vouchers & Promos - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
