import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOfferList,
  getOfferDetail,
  postApplyPromo,
  postApplyVoucher,
  postApplyPayLaterPromo,
  postApplyPayLaterVoucher,
} from './api-request';

export const fetchRewardList = createAsyncThunk(
  'app/rewards/fetchRewardList',
  async ({ search, shippingType, merchantName }) => {
    const result = await getOfferList({ search, shippingType, merchantName });

    return result;
  }
);

export const fetchRewardDetail = createAsyncThunk(
  'app/rewards/fetchRewardDetail',
  async ({ id, uniquePromotionCodeId, type }) => {
    const result = await getOfferDetail({ id, uniquePromotionCodeId, type });

    return result;
  }
);

export const applyPromo = createAsyncThunk(
  'app/rewards/applyPromo',
  async ({ id, fulfillDate, shippingType, uniquePromotionCodeId }) => {
    const result = await postApplyPromo({ id, fulfillDate, shippingType, uniquePromotionCodeId });

    return result;
  }
);

export const applyVoucher = createAsyncThunk(
  'app/rewards/applyVoucher',
  async ({ fulfillDate, shippingType, code }) => {
    const result = await postApplyVoucher({ fulfillDate, shippingType, code });

    return result;
  }
);

export const applyPayLaterPromo = createAsyncThunk(
  'app/rewards/applyPayLaterPromo',
  async ({ receiptNumber, id, uniquePromotionCodeId }) => {
    const result = await postApplyPayLaterPromo({ receiptNumber, id, uniquePromotionCodeId });

    return result;
  }
);

export const applyPayLaterVoucher = createAsyncThunk(
  'app/rewards/applyPayLaterVoucher',
  async ({ receiptNumber, code }) => {
    const result = await postApplyPayLaterVoucher({ receiptNumber, code });

    return result;
  }
);
