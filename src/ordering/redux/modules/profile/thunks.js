import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileInfo } from './api-request';
import logger from '../../../../utils/monitoring/logger';

export const loadProfileInfo = createAsyncThunk('ordering/profile/loadProfileInfo', async consumerId => {
  try {
    const result = await getProfileInfo(consumerId);

    return result;
  } catch (error) {
    logger.error('Ordering_LoadProfileInfoFailed', { message: error?.message });

    throw error;
  }
});
