import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack, showCompleteProfilePageAsync } from '../../../../../../utils/native-methods';
import { fetchMerchantInfo } from '../../../../../../redux/modules/merchant/thunks';
import { getMerchantBusiness } from '../../../../../../redux/modules/merchant/selectors';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByAlipayMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getConsumerId, getIsLogin, getIsUserProfileIncomplete } from '../../../../../../redux/modules/user/selectors';
import {
  getIsWebview,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getIsNotLoginInWeb,
} from '../../../../../redux/modules/common/selectors';
import { getCustomerCustomerId } from '../../../../../redux/modules/customer/selectors';
import { fetchCustomerInfo } from '../../../../../redux/modules/customer/thunks';
import {
  getPointsRewardRewardSettingId,
  getPointsRewardPromotionId,
  getPointsRewardPromotionUniquePromoCodeId,
} from './selectors';
import { getPointsRewardDetail, postClaimedPointsReward } from './api-request';

export const showWebProfileForm = createAsyncThunk(
  'rewards/business/pointsRewardDetail/showWebProfileForm',
  async () => {}
);

export const hideWebProfileForm = createAsyncThunk(
  'rewards/business/pointsRewardDetail/hideWebProfileForm',
  async () => {}
);

export const fetchPointsRewardDetail = createAsyncThunk(
  'rewards/business/pointsRewardDetail/fetchPointsRewardDetail',
  async (customerId, { getState }) => {
    const state = getState();
    const rewardSettingId = getPointsRewardRewardSettingId(state);

    const result = await getPointsRewardDetail(rewardSettingId, { customerId });

    return result;
  }
);

export const claimPointsReward = createAsyncThunk(
  'rewards/business/pointsRewardDetail/claimPointsReward',
  async (_, { getState }) => {
    const state = getState();
    const business = getMerchantBusiness(state);
    const id = getPointsRewardPromotionId(state);
    const consumerId = getConsumerId(state);
    const result = await postClaimedPointsReward({ consumerId, business, id });

    return result;
  }
);

export const showProfileForm = createAsyncThunk(
  'rewards/business/pointsRewards/showProfileForm',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      await showCompleteProfilePageAsync({ hideSkipButton: true });
      return;
    }

    await dispatch(showWebProfileForm());
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/pointsRewardDetail/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const isWebview = getIsWebview(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const search = getLocationSearch(state);

    CleverTap.pushEvent('Get Rewards Details Page - View Page');

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
      await dispatch(fetchCustomerInfo(merchantBusiness));

      const customerId = getCustomerCustomerId(getState());

      dispatch(fetchPointsRewardDetail(customerId));
    }
  }
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewardDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('Get Rewards Details Page - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const pointsClaimRewardButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewardDetail/pointsClaimRewardButtonClicked',
  async ({ status, type, costOfPoints }, { dispatch, getState }) => {
    if (status) {
      CleverTap.pushEvent('Points Rewards Detail Page - Spend Points Modal - Click Confirm', {
        type,
        costOfPoints,
      });

      const state = getState();
      const isUserProfileIncomplete = getIsUserProfileIncomplete(state);

      if (isUserProfileIncomplete) {
        dispatch(showProfileForm());

        return;
      }

      dispatch(claimPointsReward());
    } else {
      CleverTap.pushEvent('Points Rewards Detail Page - Spend Points Modal - Click Cancel', {
        type,
        costOfPoints,
      });
    }
  }
);

export const viewRewardButtonClicked = createAsyncThunk(
  'rewards/business/pointsRewardDetail/viewRewardButtonClicked',
  async (status, { dispatch, getState }) => {
    if (status) {
      const merchantBusiness = getMerchantBusiness(getState());
      const id = getPointsRewardPromotionId(getState());
      const uniquePromotionCodeId = getPointsRewardPromotionUniquePromoCodeId(getState());

      const pathname = `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.DETAIL}`;
      const search = `?business=${merchantBusiness}&id=${id}&up_id=${uniquePromotionCodeId}`;
      const state = {
        redirectLocation: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      };

      dispatch(replace(`${pathname}${search}`, state));
    } else {
      dispatch(backButtonClicked());
    }
  }
);
