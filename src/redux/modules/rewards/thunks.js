import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOfferList, getOfferDetail, postApplyPromo, postApplyVoucher } from './api-request';

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
  async ({ shippingType, voucherCode, applyCashback }) => {
    const result = await postApplyVoucher({ shippingType, voucherCode, applyCashback });

    return result;
  }
);
