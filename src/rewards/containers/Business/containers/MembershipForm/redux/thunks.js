import { createAsyncThunk } from '@reduxjs/toolkit';
import { postUserMembership } from './api-request';
import { goBack } from '../../../../../../utils/native-methods';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import { fetchUserLoginStatus } from '../../../../../../redux/modules/user/thunks';

export const mounted = createAsyncThunk('rewards/business/membershipForm/mounted', async (_, { dispatch }) =>
  dispatch(fetchUserLoginStatus())
);

export const backButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/backButtonClicked',
  async (_, { dispatch }) => dispatch(goBack())
);

export const retryButtonClicked = createAsyncThunk('rewards/business/membershipForm/retryButtonClicked', async () =>
  window.location.reload()
);

export const joinMembership = createAsyncThunk('rewards/business/membershipForm/joinMembership', async () =>
  postUserMembership()
);

export const joinNowButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/joinNowButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const isLogin = getIsLogin(state);

    if (isLogin) {
      await dispatch(joinMembership());
    }
  }
);
