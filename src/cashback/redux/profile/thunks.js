import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileInfo } from './api-request';
import logger from '../../../utils/monitoring/logger';

export const loadProfileInfo = createAsyncThunk('cashback/profile/loadProfileInfo', async consumerId => {
  try {
    const result = await getProfileInfo(consumerId);

    return result;
  } catch (error) {
    logger.error('Cashback_LoadProfileInfoFailed', { message: error?.message });

    throw error;
  }
});
