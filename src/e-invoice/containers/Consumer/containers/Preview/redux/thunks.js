import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { PAGE_ROUTES, E_INVOICE_TYPES } from '../../../../../utils/constants';
import {
  postOrderDetailForConsumerMalaysianEInvoice,
  postOrderDetailForConsumerNonMalaysianEInvoice,
} from './api-request';
import {
  getIsWebview,
  getIsLoadEInvoiceStatusFulfilled,
  getIsQueryEInvoiceStatusRejected,
  getHash,
  getEInvoiceMerchantName,
  getEInvoiceReceiptNumber,
  getEInvoiceChannel,
} from '../../../../../redux/modules/common/selectors';
import { fetchEInvoiceStatus } from '../../../../../redux/modules/common/thunks';
import { getConsumerMalaysianSubmissionData } from '../../../redux/submission/malaysian/selector';
import { getConsumerNonMalaysianSubmissionData } from '../../../redux/submission/nonMalaysian/selector';
import {
  getIsSubmitMalaysianOrderForEInvoiceFulfilled,
  getIsSubmitNonMalaysianOrderForEInvoiceFulfilled,
} from './selectors';

export const resetConsumerMalaysianFormData = createAsyncThunk(
  'eInvoice/consumer/preview/resetConsumerMalaysianFormData',
  async () => {}
);

export const resetConsumerNonMalaysianFormData = createAsyncThunk(
  'eInvoice/consumer/preview/resetConsumerNonMalaysianFormData',
  async () => {}
);

export const backButtonClicked = createAsyncThunk(
  'eInvoice/consumer/preview/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const submitConsumerMalaysianOrderForEInvoice = createAsyncThunk(
  'eInvoice/consumer/preview/submitConsumerMalaysianOrderForEInvoice',
  async (_, { getState }) => {
    const state = getState();
    const h = getHash(state);
    const merchantName = getEInvoiceMerchantName(state);
    const receiptNumber = getEInvoiceReceiptNumber(state);
    const channel = getEInvoiceChannel(state);
    const malaysianSubmissionData = getConsumerMalaysianSubmissionData(state);
    const orderInfo = {
      merchantName,
      receiptNumber,
      channel,
    };
    const result = await postOrderDetailForConsumerMalaysianEInvoice(
      { ...orderInfo, type: E_INVOICE_TYPES.MALAYSIAN, submissionInfo: malaysianSubmissionData },
      {
        h,
        ...orderInfo,
      }
    );

    return result;
  }
);

export const submitConsumerNonMalaysianOrderForEInvoice = createAsyncThunk(
  'eInvoice/consumer/preview/submitConsumerNonMalaysianOrderForEInvoice',
  async (_, { getState }) => {
    const state = getState();
    const h = getHash(state);
    const merchantName = getEInvoiceMerchantName(state);
    const receiptNumber = getEInvoiceReceiptNumber(state);
    const channel = getEInvoiceChannel(state);
    const nonMalaysianSubmissionData = getConsumerNonMalaysianSubmissionData(state);
    const orderInfo = {
      merchantName,
      receiptNumber,
      channel,
    };
    const result = await postOrderDetailForConsumerNonMalaysianEInvoice(
      { ...orderInfo, type: E_INVOICE_TYPES.NON_MALAYSIAN, submissionInfo: nonMalaysianSubmissionData },
      {
        h,
        ...orderInfo,
      }
    );

    return result;
  }
);

export const clickConsumerMalaysianPreviewContinueButton = createAsyncThunk(
  'eInvoice/consumer/preview/clickContinueButton',
  async (_, { dispatch, getState }) => {
    await dispatch(submitConsumerMalaysianOrderForEInvoice());

    const isSubmitMalaysianOrderForEInvoiceFulfilled = getIsSubmitMalaysianOrderForEInvoiceFulfilled(getState());

    if (isSubmitMalaysianOrderForEInvoiceFulfilled) {
      await dispatch(fetchEInvoiceStatus());

      const isQueryEInvoiceStatusRejected = getIsQueryEInvoiceStatusRejected(getState());
      const isLoadEInvoiceStatusFulfilled = getIsLoadEInvoiceStatusFulfilled(getState());

      if (isQueryEInvoiceStatusRejected) {
        dispatch(push(`${PAGE_ROUTES.CONSUMER_FORM}?type=${E_INVOICE_TYPES.MALAYSIAN}`));
      } else if (isLoadEInvoiceStatusFulfilled) {
        await dispatch(resetConsumerMalaysianFormData());
        dispatch(push(PAGE_ROUTES.E_INVOICE));
      }
    }
  }
);

export const clickConsumerNonMalaysianPreviewContinueButton = createAsyncThunk(
  'eInvoice/consumer/preview/clickConsumerNonMalaysianPreviewContinueButton',
  async (_, { dispatch, getState }) => {
    await dispatch(submitConsumerNonMalaysianOrderForEInvoice());

    const isSubmitNonMalaysianOrderForEInvoiceFulfilled = getIsSubmitNonMalaysianOrderForEInvoiceFulfilled(getState());

    if (isSubmitNonMalaysianOrderForEInvoiceFulfilled) {
      await dispatch(fetchEInvoiceStatus());

      const isQueryEInvoiceStatusRejected = getIsQueryEInvoiceStatusRejected(getState());
      const isLoadEInvoiceStatusFulfilled = getIsLoadEInvoiceStatusFulfilled(getState());

      if (isQueryEInvoiceStatusRejected) {
        dispatch(push(`${PAGE_ROUTES.CONSUMER_FORM}?type=${E_INVOICE_TYPES.NON_MALAYSIAN}`));
      } else if (isLoadEInvoiceStatusFulfilled) {
        await dispatch(resetConsumerNonMalaysianFormData());
        dispatch(push(PAGE_ROUTES.E_INVOICE));
      }
    }
  }
);
