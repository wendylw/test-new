import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { PAGE_ROUTES, E_INVOICE_STATUS } from '../../../utils/constants';
import { getEInvoice } from './api-request';
import { fetchMerchantInfo } from '../../../../redux/modules/merchant/thunks';
import {
  getHash,
  getEInvoiceMerchantName,
  getEInvoiceReceiptNumber,
  getEInvoiceChannel,
  getEInvoiceSubmissionInfoType,
  getIsBusinessEInvoiceSubmission,
  getIsQueryEInvoiceStatusValid,
  getIsQueryEInvoiceStatusCancel,
  getIsQueryEInvoiceStatusRejected,
} from '../../../redux/modules/common/selectors';
import { actions as eInvoiceCommonActions } from '../../../redux/modules/common';
import { queryEInvoiceStatus, fetchEInvoiceSubmissionDetail } from '../../../redux/modules/common/thunks';
import { getIsEInvoiceSubmitted } from './selectors';

export const resetEInvoice = createAsyncThunk('eInvoice/home/resetEInvoice', async () => {});

export const setTimeoutError = createAsyncThunk('eInvoice/home/setTimeoutError', async timeoutError => timeoutError);

/**
 * @param {undefined}
 * @return {Object} {receiptNumber, createdTime, total, storeInfo, eInvoice}
 */
export const fetchEInvoice = createAsyncThunk('eInvoice/home/fetchEInvoice', async (_, { getState }) => {
  const state = getState();
  const h = getHash(state);
  const merchantName = getEInvoiceMerchantName(state);
  const receiptNumber = getEInvoiceReceiptNumber(state);
  const channel = getEInvoiceChannel(state);
  const result = await getEInvoice({
    h,
    merchantName,
    receiptNumber,
    channel,
  });

  return result;
});

export const rejectedEInvoiceGoToFormPage = createAsyncThunk(
  'eInvoice/home/rejectedEInvoiceGoToFormPage',
  async (_, { dispatch, getState }) => {
    await dispatch(fetchEInvoiceSubmissionDetail());

    const type = getEInvoiceSubmissionInfoType(getState());
    const isBusinessEInvoiceSubmission = getIsBusinessEInvoiceSubmission(getState());

    dispatch(
      push(`${isBusinessEInvoiceSubmission ? PAGE_ROUTES.BUSINESS_FORM : PAGE_ROUTES.CONSUMER_FORM}?type=${type}`, {
        status: E_INVOICE_STATUS.REJECT,
      })
    );
  }
);

export const mount = createAsyncThunk('eInvoice/home/mount', async (_, { dispatch, getState }) => {
  const state = getState();
  const merchantName = getEInvoiceMerchantName(state);

  dispatch(fetchMerchantInfo(merchantName));
  await dispatch(fetchEInvoice());

  const isEInvoiceSubmitted = getIsEInvoiceSubmitted(getState());

  if (isEInvoiceSubmitted) {
    dispatch(queryEInvoiceStatus());
  }
});

export const unmount = createAsyncThunk('eInvoice/home/unmount', async (_, { dispatch }) => {
  dispatch(eInvoiceCommonActions.loadEInvoiceStatusRequestErrorReset());
  dispatch(resetEInvoice());
});

export const completedSubmission = createAsyncThunk(
  'eInvoice/home/completedSubmission',
  async (_, { dispatch, getState }) => {
    const state = getState();

    const isQueryEInvoiceStatusRejected = getIsQueryEInvoiceStatusRejected(state);
    const isQueryEInvoiceStatusValid = getIsQueryEInvoiceStatusValid(state);
    const isQueryEInvoiceStatusCancel = getIsQueryEInvoiceStatusCancel(state);

    if (isQueryEInvoiceStatusRejected) {
      await dispatch(rejectedEInvoiceGoToFormPage());
    } else if (isQueryEInvoiceStatusValid || isQueryEInvoiceStatusCancel) {
      await dispatch(fetchEInvoice());
    }
  }
);
