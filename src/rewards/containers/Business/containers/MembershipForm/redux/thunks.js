import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack } from '../../../../../../utils/native-methods';

export const mounted = createAsyncThunk('rewards/business/membershipForm/mounted', async () => {});

export const backButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/backButtonClicked',
  async (_, { dispatch }) => dispatch(goBack())
);

export const retryButtonClicked = createAsyncThunk('rewards/business/membershipForm/retryButtonClicked', async () =>
  window.location.reload()
);

export const joinNowButtonClicked = createAsyncThunk(
  'rewards/business/membershipForm/joinNowButtonClicked',
  async () => {}
);
