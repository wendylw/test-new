import { createAsyncThunk } from '@reduxjs/toolkit';
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

  fetchMerchantInfo(merchantBusiness);

  await initUserInfo();

  if (isWebview) {
    await loginUserByBeepApp();
  }

  if (isAlipayMiniProgram) {
    await loginUserByAlipayMiniProgram();
  }

  const { isLogin } = this.props;

  if (isLogin) {
    await loadConsumerCustomerInfo();
    dispatch(fetchCashbackHistoryList());
  }
});
