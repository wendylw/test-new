import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
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
import { getUniquePromoUniquePromotionCodeId } from './selectors';
import { getUniquePromotionDetail } from './api-request';

export const fetchUniquePromoDetail = createAsyncThunk(
  'rewards/business/uniquePromoDetail/fetchUniquePromoDetail',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const uniquePromotionCodeId = getUniquePromoUniquePromotionCodeId(state);

    const result = await getUniquePromotionDetail({ consumerId, uniquePromotionCodeId });

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/uniquePromoDetail/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

    CleverTap.pushEvent('My Rewards Page - View Page');

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

    dispatch(fetchMerchantInfo(merchantBusiness));

    if (isLogin) {
      dispatch(fetchUniquePromoDetail());
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/uniquePromoDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const { redirectLocation } = window.location.state || {};

    if (redirectLocation) {
      const merchantBusiness = getMerchantBusiness(getState());

      dispatch(
        replace(`${redirectLocation}?business=${merchantBusiness}`, {
          redirectLocation: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.MEMBERSHIP_DETAIL}`,
        })
      );
    }

    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('My Rewards Detail Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
