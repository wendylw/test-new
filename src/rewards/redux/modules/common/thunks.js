import { createAsyncThunk } from '@reduxjs/toolkit';
import { getQueryString } from '../../../../common/utils';

export const mounted = createAsyncThunk('rewards/common/mounted', async () => ({
  source: getQueryString('source'),
}));
