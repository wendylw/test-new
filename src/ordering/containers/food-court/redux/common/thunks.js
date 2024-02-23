import { push } from 'connected-react-router';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFoodCourtId } from './selectors';
import { fetchFoodCourtStoreList } from './api-request';
import { isWebview, getQueryString } from '../../../../../common/utils';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import {
  actions as appActions,
  getUserIsLogin,
  getShippingType,
  getIsAlipayMiniProgram,
} from '../../../../redux/modules/app';
import logger from '../../../../../utils/monitoring/logger';

/**
 * Food court landing page mounted
 */
export const mounted = createAsyncThunk('ordering/foodCourt/common/mounted', async (_, { getState }) => {
  // - Load store List of this food court

  const state = getState();
  const foodCourtId = getFoodCourtId(state);
  const shippingType = getShippingType(state);
  const h = getQueryString('h');

  try {
    /**
     * WB-5405: If the food court id does not exist, refresh the current page to fix the session cookies missing issue.
     * NOTE: This fix only works when the h exists while the food court id is missing.
     * Otherwise, the page will be stuck in a loop in the `/ordering/food-court` path.
     */
    if (!!h && !foodCourtId) {
      window.location.reload();
      throw new Error('food court id is not exist in session cookies');
    }

    const foodCourtStoreList = await fetchFoodCourtStoreList({ foodCourtId, type: shippingType });

    return foodCourtStoreList;
  } catch (error) {
    logger.error('Ordering_FoodCourt_FetchFoodCourtStoreListFailed', { message: error?.message });

    throw error;
  }
});

/**
 * Selected a store of this food court landing page
 */
export const selectedOneStore = createAsyncThunk(
  'ordering/foodCourt/common/selectedOneStore',
  async ({ businessName, redirectUrl }, { dispatch, getState }) => {
    const state = getState();
    const userSignedIn = getUserIsLogin(state);
    const shippingType = getShippingType(state);
    const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
    const hostList = window.location.host.split('.');

    hostList[0] = businessName;

    const redirectLocation = `${window.location.protocol}//${hostList.join('.')}${
      PATH_NAME_MAPPING.ORDERING_BASE
    }${redirectUrl}&source=${encodeURIComponent(document.location.href)}`;

    if (userSignedIn) {
      window.location.href = redirectLocation;

      return;
    }

    if (isAlipayMiniProgram) {
      await dispatch(appActions.loginByAlipayMiniProgram());

      if (getUserIsLogin(getState())) {
        window.location.href = redirectLocation;
      }

      return;
    }

    if (isWebview()) {
      await dispatch(appActions.loginByBeepApp());

      if (getUserIsLogin(getState())) {
        window.location.href = redirectLocation;
      }

      return;
    }

    dispatch(
      push(`${PATH_NAME_MAPPING.ORDERING_LOGIN}${window.location.search}`, {
        shouldGoBack: true,
        isRedirect: true,
        redirectLocation,
        loginOptions: { shippingType },
      })
    );
  }
);
