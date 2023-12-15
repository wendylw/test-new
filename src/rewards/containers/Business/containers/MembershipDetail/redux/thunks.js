import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUniquePromoList } from './api-request';
import { initUserInfo } from '../../../../../../redux/modules/user/thunks';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { fetchMerchantInfo } from '../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';

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
  const business = getMerchantBusiness(getState());

  await dispatch(initUserInfo());

  const isLogin = getIsLogin(getState());

  if (!isLogin) {
    return;
  }

  dispatch(fetchMerchantInfo());
  dispatch(fetchCustomerInfo(business));
  dispatch(fetchUniquePromoList());
});
