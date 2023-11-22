import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserLoginStatus } from './api-request';

export const fetchUserLoginStatus = createAsyncThunk('app/user/getUserLoginStatus', async () => {
  const { consumerId = null, login = false } = await getUserLoginStatus();
  return { consumerId, login };
});
