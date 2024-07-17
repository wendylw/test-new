import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { PAGE_ROUTES, E_INVOICE_TYPES } from '../../../../../utils/constants';
import { postOrderDetailForBusinessEInvoice } from './api-request';
import {
  getIsWebview,
  getHash,
  getEInvoiceMerchantName,
  getEInvoiceReceiptNumber,
  getEInvoiceChannel,
  getIsLoadEInvoiceStatusFulfilled,
  getIsQueryEInvoiceStatusRejected,
} from '../../../../../redux/modules/common/selectors';
import { fetchEInvoiceStatus } from '../../../../../redux/modules/common/thunks';
import { getBusinessSubmissionData } from '../../../redux/submission/selector';
import { getIsSubmitBusinessOrderForEInvoiceFulfilled } from './selectors';

export const resetBusinessFormData = createAsyncThunk(
  'eInvoice/business/preview/resetBusinessFormData',
  async () => {}
);

export const backButtonClicked = createAsyncThunk(
  'eInvoice/business/preview/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const submitBusinessOrderForEInvoice = createAsyncThunk(
  'eInvoice/business/preview/submitBusinessOrderForEInvoice',
  async (_, { getState }) => {
    const state = getState();
    const h = getHash(state);
    const merchantName = getEInvoiceMerchantName(state);
    const receiptNumber = getEInvoiceReceiptNumber(state);
    const channel = getEInvoiceChannel(state);
    const businessSubmissionData = getBusinessSubmissionData(state);
    const orderInfo = {
      merchantName,
      receiptNumber,
      channel,
    };
    const result = await postOrderDetailForBusinessEInvoice(
      {
        ...orderInfo,
        type: E_INVOICE_TYPES.BUSINESS,
        submissionInfo: businessSubmissionData,
      },
      {
        h,
        ...orderInfo,
      }
    );

    return result;
  }
);

export const clickBusinessPreviewContinueButton = createAsyncThunk(
  'eInvoice/consumer/preview/clickContinueButton',
  async (_, { dispatch, getState }) => {
    await dispatch(submitBusinessOrderForEInvoice());

    const isSubmitBusinessOrderForEInvoiceFulfilled = getIsSubmitBusinessOrderForEInvoiceFulfilled(getState());

    if (isSubmitBusinessOrderForEInvoiceFulfilled) {
      await dispatch(fetchEInvoiceStatus());

      const isQueryEInvoiceStatusRejected = getIsQueryEInvoiceStatusRejected(getState());
      const isLoadEInvoiceStatusFulfilled = getIsLoadEInvoiceStatusFulfilled(getState());

      if (isQueryEInvoiceStatusRejected) {
        dispatch(push(`${PAGE_ROUTES.BUSINESS_FORM}?type=${E_INVOICE_TYPES.BUSINESS}`));
      } else if (isLoadEInvoiceStatusFulfilled) {
        await dispatch(resetBusinessFormData());
        dispatch(push(PAGE_ROUTES.E_INVOICE));
      }
    }
  }
);
