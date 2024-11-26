import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import CleverTap from '../../../../../../utils/clevertap';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getConsumerId, getIsLogin } from '../../../../../../redux/modules/user/selectors';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import { fetchPointsRewardList } from '../../../redux/common/thunks';

export const mounted = createAsyncThunk('rewards/business/pointsRewards/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getMerchantBusiness(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('Get Rewards Page - View Page');

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
    const consumerId = getConsumerId(getState());

    dispatch(fetchMerchantInfo(business));
    dispatch(fetchCustomerInfo(business));
    dispatch(fetchPointsRewardList(consumerId));
  }
});

export const backButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewards/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('Get Rewards Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
