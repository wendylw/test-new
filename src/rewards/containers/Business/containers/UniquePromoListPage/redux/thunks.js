import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
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
import { fetchUniquePromoList } from '../../../redux/common/thunks';

export const mounted = createAsyncThunk(
  'rewards/business/uniquePromoListPage/mounted',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

    CleverTap.pushEvent('My Rewards Page - View Page', { 'account name': business });

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
      dispatch(fetchUniquePromoList(consumerId));
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/uniquePromoListPage/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());
    const business = getMerchantBusiness(getState());

    CleverTap.pushEvent('My Rewards Page - Click Back', { 'account name': business });

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
