import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { setCookieVariable, getCookieVariable, removeCookieVariable } from '../../../../../../common/utils';
import { REFERRER_SOURCE_TYPES, PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import Growthbook from '../../../../../../utils/growthbook';
import { getIsLogin, getConsumerId } from '../../../../../../redux/modules/user/selectors';
import {
  initUserInfo,
  loginUserByBeepApp,
  loginUserByTngMiniProgram,
} from '../../../../../../redux/modules/user/thunks';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo } from '../../../../../redux/modules/merchant/thunks';
import {
  getIsWeb,
  getIsWebview,
  getIsTNGMiniProgram,
  getLocationSearch,
  getSource,
} from '../../../../../redux/modules/common/selectors';
import { postClaimUniquePromo } from './api-request';
import { getUniquePromoRewardsSetId } from './selectors';

export const claimUniquePromo = createAsyncThunk(
  'rewards/business/claimUniquePromo/claimUniquePromo',
  async (_, { getState }) => {
    const state = getState();
    const rewardsSetId = getUniquePromoRewardsSetId(state);
    const consumerId = getConsumerId(state);
    const source = getSource(state);
    const merchantBusiness = getMerchantBusiness(state);

    const result = await postClaimUniquePromo({
      id: rewardsSetId,
      consumerId,
      source,
      business: merchantBusiness,
    });

    return result;
  }
);

export const mounted = createAsyncThunk(
  'rewards/business/claimUniquePromo/mounted',
  async (_, { getState, dispatch }) => {
    await dispatch(fetchMerchantInfo());

    const business = getMerchantBusiness(getState());
    const country = getMerchantCountry(getState());

    Growthbook.patchAttributes({ business, country });

    await dispatch(initUserInfo());

    const isLogin = getIsLogin(getState());

    if (!isLogin) {
      return;
    }

    const from = getCookieVariable('__cp_source');
    removeCookieVariable('__cp_source');

    if (from === REFERRER_SOURCE_TYPES.LOGIN) {
      dispatch(claimUniquePromo());
    }
  }
);

export const claimPromotionClicked = createAsyncThunk(
  'rewards/business/claimUniquePromo/claimPromotionClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const isTNGMiniProgram = getIsTNGMiniProgram(state);
    const isWeb = getIsWeb(state);
    const search = getLocationSearch(state);

    if (isWebview) {
      await dispatch(loginUserByBeepApp());
    }

    if (isTNGMiniProgram) {
      await dispatch(loginUserByTngMiniProgram());
    }

    const isLogin = getIsLogin(getState());

    if (isWeb && !isLogin) {
      setCookieVariable('__cp_source', REFERRER_SOURCE_TYPES.LOGIN);
      dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

      return;
    }

    if (isLogin) {
      dispatch(claimUniquePromo());
    }
  }
);
