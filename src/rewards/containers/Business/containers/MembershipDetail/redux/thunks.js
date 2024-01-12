import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { getUniquePromoList } from './api-request';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByTngMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { getIsWebview, getIsTNGMiniProgram, getLocationSearch } from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';

export const fetchUniquePromoList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPromoList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);

export const mounted = createAsyncThunk('rewards/business/memberDetail/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isTNGMiniProgram = getIsTNGMiniProgram(state);
  const search = getLocationSearch(state);

  await dispatch(initUserInfo());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isTNGMiniProgram) {
    await dispatch(loginUserByTngMiniProgram());
  }

  const isLogin = getIsLogin(getState());
  const isNotLoginInWeb = !isLogin && !isWebview && !isTNGMiniProgram;

  if (isNotLoginInWeb) {
    dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

    return;
  }

  if (isLogin) {
    dispatch(fetchMerchantInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchUniquePromoList());
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
