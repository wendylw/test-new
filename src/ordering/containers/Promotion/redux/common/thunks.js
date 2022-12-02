import { createAsyncThunk } from '@reduxjs/toolkit';
import { applyPromotion, removePromotion, applyVoucher, removeVoucher } from './api-request';
import { getSelectedPromoId, getSelectedPromoCode } from '../../../../redux/modules/promotion';
import { getIsCashbackApplied } from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';

const formatErrorOfApplyPromoOrVoucher = e => ({ name: JSON.stringify(e.extra), code: e.code, message: e.message });

const removePromoOrVoucher = async removeMethods => {
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await removeMethods({ receiptNumber });

    return result;
  } catch (e) {
    console.error(e);

    throw e;
  }
};

/**
 * Promotion part
 */
export const applyPromo = createAsyncThunk('ordering/promotion/common/applyPromo', async (_, { getState }) => {
  const state = getState();
  const promotionId = getSelectedPromoId(state);
  const applyCashback = getIsCashbackApplied(state);
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await applyPromotion({ receiptNumber, promotionId, applyCashback });

    return result;
  } catch (e) {
    console.error(formatErrorOfApplyPromoOrVoucher(e));

    throw formatErrorOfApplyPromoOrVoucher(e);
  }
});

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
    const applyCashback = getIsCashbackApplied(state);
    const receiptNumber = Utils.getQueryString('receiptNumber');
    try {
      const result = await applyVoucher({ receiptNumber, voucherCode, applyCashback });

      return result;
    } catch (e) {
      console.error(formatErrorOfApplyPromoOrVoucher(e));

      throw formatErrorOfApplyPromoOrVoucher(e);
    }
  }
);

export const removeVoucherPayLater = createAsyncThunk('ordering/promotion/common/removeVoucherPayLater', () =>
  removePromoOrVoucher(removeVoucher)
);
