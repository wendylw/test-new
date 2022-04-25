import { push } from 'connected-react-router';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFoodCourtId } from './selectors';
import { fetchFoodCourtStoreList } from './api-request';
import { isWebview, isTNGMiniProgram } from '../../../../../common/utils';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { actions as appActions, getUserIsLogin, getShippingType } from '../../../../redux/modules/app';

/**
 * Food court landing page mounted
 */
export const mounted = createAsyncThunk('ordering/foodCourt/common/mounted', async (_, { getState }) => {
  // - Load store List of this food court

  const state = getState();
  const foodCourtId = getFoodCourtId(state);

  try {
    const foodCourtStoreList = await fetchFoodCourtStoreList(foodCourtId);

    return foodCourtStoreList;
  } catch (e) {
    console.error('load store list failed on food court landing page');

    throw e;
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
    const hostList = window.location.host.split('.');
    const redirectLocation = `${window.location.protocol}//${hostList.join('.')}${
      PATH_NAME_MAPPING.ORDERING_BASE
    }${redirectUrl}`;

    hostList[0] = businessName;

    if (userSignedIn) {
      window.location.href = redirectLocation;

      return;
    }

    if (isTNGMiniProgram()) {
      await dispatch(appActions.loginByTngMiniProgram());

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
