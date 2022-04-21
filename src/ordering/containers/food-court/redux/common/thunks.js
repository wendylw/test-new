import { push } from 'connected-react-router';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFoodCourtId } from './selectors';
import { fetchFoodCourtStoreList } from './api-request';
import { isWebview, isTNGMiniProgram } from '../../../../../common/utils';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { actions as appActions, getUserIsLogin } from '../../../../redux/modules/app';

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
    const hostList = window.location.host.split('.');

    hostList[0] = businessName;

    if (userSignedIn) {
      window.location.href = `${window.location.protocol}//${hostList.join('.')}${
        PATH_NAME_MAPPING.ORDERING_BASE
      }${redirectUrl}`;

      return;
    }

    if (isTNGMiniProgram()) {
      await dispatch(appActions.loginByTngMiniProgram());
    }

    if (isWebview()) {
      await dispatch(appActions.loginByBeepApp());
    }

    dispatch(
      push(`${PATH_NAME_MAPPING.ORDERING_LOGIN}${redirectUrl}`, {
        isRedirect: true,
        shouldGoBack: true,
        redirectLocation: `${window.location.protocol}//${hostList.join('.')}${
          PATH_NAME_MAPPING.ORDERING_BASE
        }${redirectUrl}`,
      })
    );
  }
);
