import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderRewards, postClaimedOrderRewards } from './api-request';

export const loadOrderRewards = createAsyncThunk(
  'app/transaction/loadOrderRewards',
  async ({ business, receiptNumber, channel }) => {
    const result = await getOrderRewards({ receiptNumber, business, channel });

    return result;
  }
);

export const claimOrderRewards = createAsyncThunk(
  'app/transaction/claimOrderRewards',
  async ({ business, receiptNumber, channel, source, storeId }) => {
    const result = await postClaimedOrderRewards({ receiptNumber, business, channel, source, storeId });

    return result;
  }
);
