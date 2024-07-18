import { createAsyncThunk } from '@reduxjs/toolkit';
import { applyPromotion, removePromotion, applyVoucher, removeVoucher } from './api-request';
import {
  getSelectedPromoId,
  getSelectedPromotionCodeId,
  getSelectedPromoCode,
} from '../../../../redux/modules/promotion';
import Utils from '../../../../../utils/utils';
import logger from '../../../../../utils/monitoring/logger';

const removePromoOrVoucher = async removeMethods => {
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await removeMethods({ receiptNumber });

    return result;
  } catch (e) {
    logger.error('Ordering_Promotion_removePromoOrVoucherFailed', { message: e?.message || '' });

    throw e;
  }
};

/**
 * Promotion part
 */
export const applyPromo = createAsyncThunk(
  'ordering/promotion/common/applyPromo',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const promotionId = getSelectedPromoId(state);
    const promotionCodeId = getSelectedPromotionCodeId(state);
    const receiptNumber = Utils.getQueryString('receiptNumber');
    try {
      const result = await applyPromotion({ receiptNumber, promotionId, promotionCodeId });

      return result;
    } catch (e) {
      logger.error('Ordering_Promotion_applyPromoFailed', { message: e?.message || '' });

      // WB-7385: If error only with {code, message, name, stack}, If error want to with other fields.
      // We need to use rejectWithValue to pass the error as payload
      throw rejectWithValue(e);
    }
  }
);

export const removePromo = createAsyncThunk('ordering/promotion/common/removePromotion', () =>
  removePromoOrVoucher(removePromotion)
);

/**
 * Voucher part
 */
export const applyVoucherPayLater = createAsyncThunk(
  'ordering/promotion/common/applyVoucherPayLater',
  async (_, { getState }) => {
    const state = getState();
    const voucherCode = getSelectedPromoCode(state);
    const receiptNumber = Utils.getQueryString('receiptNumber');
    try {
      const result = await applyVoucher({ receiptNumber, voucherCode });

      return result;
    } catch (e) {
      logger.error('Ordering_Promotion_applyVoucherPayLater', { message: e?.message || '' });

      throw e;
    }
  }
);

export const removeVoucherPayLater = createAsyncThunk('ordering/promotion/common/removeVoucherPayLater', () =>
  removePromoOrVoucher(removeVoucher)
);
