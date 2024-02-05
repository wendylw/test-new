import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { initUserInfo } from '../../../../../../redux/modules/user/thunks';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';

export const mounted = createAsyncThunk(
  'rewards/business/cashbackDetail/mounted',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);

    dispatch(fetchMerchantInfo(business));
    await dispatch(initUserInfo());

    const isLogin = getIsLogin(getState());

    // If user is not login, we will display expired session result
    if (isLogin) {
      dispatch(fetchCustomerInfo(business));
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/cashbackDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
