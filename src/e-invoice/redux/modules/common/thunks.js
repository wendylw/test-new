/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import logger from '../../../../utils/monitoring/logger';
import Poller from '../../../../common/utils/poller';
import { AVAILABLE_QUERY_E_INVOICE_STATUS_PAGES } from '../../../utils/constants';
import { getEInvoiceStatus, getEInvoiceSubmissionDetail } from './api-request';
import {
  getHash,
  getEInvoiceMerchantName,
  getEInvoiceReceiptNumber,
  getEInvoiceChannel,
  getIsAvailableQuerySubmissionPage,
  getQuerySubmissionPagePollerKey,
} from './selectors';

const E_INVOICE_STATUS_TIMEOUT = 10 * 1000;
const E_INVOICE_STATUS_INTERVAL = 2 * 1000;

export const fetchEInvoiceStatus = createAsyncThunk('eInvoice/common/fetchEInvoiceStatus', async (_, { getState }) => {
  const state = getState();
  const h = getHash(state);
  const merchantName = getEInvoiceMerchantName(state);
  const receiptNumber = getEInvoiceReceiptNumber(state);
  const channel = getEInvoiceChannel(state);
  const result = await getEInvoiceStatus({
    h,
    merchantName,
    receiptNumber,
    channel,
  });

  return result;
});

export const fetchEInvoiceSubmissionDetail = createAsyncThunk(
  'eInvoice/common/fetchEInvoiceSubmissionDetail',
  async (_, { getState }) => {
    const state = getState();
    const h = getHash(state);
    const merchantName = getEInvoiceMerchantName(state);
    const receiptNumber = getEInvoiceReceiptNumber(state);
    const channel = getEInvoiceChannel(state);
    const result = await getEInvoiceSubmissionDetail({
      h,
      merchantName,
      receiptNumber,
      channel,
    });

    return result;
  }
);

// Diff page should use diff poller, otherwise can not stop poller correctly
const EInvoiceStatusPollers = {
  pollers: {
    [AVAILABLE_QUERY_E_INVOICE_STATUS_PAGES.HOME]: null,
    [AVAILABLE_QUERY_E_INVOICE_STATUS_PAGES.CONSUMER_PREVIEW]: null,
    [AVAILABLE_QUERY_E_INVOICE_STATUS_PAGES.BUSINESS_PREVIEW]: null,
  },
  clearPoller() {
    const keys = Object.keys(this.pollers);

    keys.forEach(key => {
      if (!this.pollers[key]) {
        return;
      }

      this.pollers[key].stop();
      this.pollers[key] = null;
    });
  },
};

export const queryEInvoiceStatus = () => async (dispatch, getState) => {
  EInvoiceStatusPollers.clearPoller();
  logger.log('EInvoice_PollEInvoiceStatus', { action: 'start' });

  try {
    const pollerKey = getQuerySubmissionPagePollerKey(getState());

    if (!pollerKey) {
      return;
    }

    EInvoiceStatusPollers.pollers[pollerKey] = new Poller({
      fetchData: async () => {
        const isAvailableQuerySubmissionPage = getIsAvailableQuerySubmissionPage(getState());

        // Add a judgment condition. There may be requests that have not been cleared before and are still being polled.
        if (isAvailableQuerySubmissionPage) {
          await dispatch(fetchEInvoiceStatus());
        }
      },
      onError: error => {
        EInvoiceStatusPollers.pollers[pollerKey].stop();
        logger.log('EInvoice_PollEInvoiceStatusFailed', { action: 'stop', error: error?.message, pollerKey });
      },
      onTimeout: () => {
        EInvoiceStatusPollers.pollers[pollerKey].stop();
      },
      timeout: E_INVOICE_STATUS_TIMEOUT,
      interval: E_INVOICE_STATUS_INTERVAL,
    });

    EInvoiceStatusPollers.pollers[pollerKey].start();
  } catch (error) {
    logger.error('EInvoice_QueryEInvoiceStatusFailed', { message: error?.message });

    throw error;
  }
};
