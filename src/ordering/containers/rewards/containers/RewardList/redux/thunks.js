import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
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

  if (isLogin) {
    dispatch(fetchRewardList({ shippingType, merchantName: business }));
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

export const searchPromos = createAsyncThunk(
  'ordering/rewardList/searchPromos',
  async (searchKeyword, { dispatch, getState }) => {
    const state = getState();
    const shippingType = getShippingType(state);
    const business = getBusiness(state);

    dispatch(fetchRewardList({ search: searchKeyword, shippingType, merchantName: business }));
  }
);
