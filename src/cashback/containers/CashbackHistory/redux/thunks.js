import { createAsyncThunk } from '@reduxjs/toolkit';
import { getIsLogin, getConsumerId } from '../../../../redux/modules/user/selectors';
import { initUserInfo, loginUserByBeepApp, loginUserByAlipayMiniProgram } from '../../../../redux/modules/user/thunks';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../redux/modules/merchant/thunks';
import { getCustomerId } from '../../../redux/modules/customer/selectors';
import { getIsWebview, getIsAlipayMiniProgram } from '../../../redux/modules/common/selectors';
import { loadConsumerCustomerInfo } from '../../../redux/modules/customer/thunks';
import { getCashbackHistoryList } from './api-request';

export const fetchCashbackHistoryList = createAsyncThunk(
  'cashback/cashbackHistory/fetchCashbackHistoryList',
  async (_, { getState }) => {
    const state = getState();
    const customerId = getCustomerId(state);
    const result = await getCashbackHistoryList(customerId);

    return result;
  }
);

export const mounted = createAsyncThunk('cashback/cashbackHistory/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const merchantBusiness = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);

  dispatch(fetchMerchantInfo(merchantBusiness));

  await dispatch(initUserInfo());

  if (isWebview) {
    await dispatch(loginUserByBeepApp());
  }

  if (isAlipayMiniProgram) {
    await dispatch(loginUserByAlipayMiniProgram());
  }

  const isLogin = getIsLogin(getState());
  const consumerId = getConsumerId(getState());

  if (isLogin) {
    await dispatch(loadConsumerCustomerInfo(consumerId));
    dispatch(fetchCashbackHistoryList());
  }
});
