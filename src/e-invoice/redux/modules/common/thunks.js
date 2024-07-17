/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import logger from '../../../../utils/monitoring/logger';
import Poller from '../../../../common/utils/poller';
import { E_INVOICE_STATUS_TIMEOUT } from '../../../utils/constants';
import { getEInvoiceStatus, getEInvoiceSubmissionDetail } from './api-request';
import {
  getHash,
  getEInvoiceMerchantName,
  getEInvoiceReceiptNumber,
  getEInvoiceChannel,
  getIsQueryEInvoiceSubmissionCompleted,
} from './selectors';

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

export const queryEInvoiceStatus = () => async (dispatch, getState) => {
  logger.log('EInvoice_PollEInvoiceStatus', { action: 'start' });

  try {
    const eInvoiceStatusPoller = new Poller({
      fetchData: async () => {
        await dispatch(fetchEInvoiceStatus());
      },
      onData: async () => {
        const isQueryEInvoiceSubmissionCompleted = getIsQueryEInvoiceSubmissionCompleted(getState());

        if (isQueryEInvoiceSubmissionCompleted) {
          eInvoiceStatusPoller.stop();
          logger.log('EInvoice_QueryEInvoiceStatusSuccess');
        }
      },
      onError: error => {
        eInvoiceStatusPoller.stop();
        logger.log('EInvoice_PollEInvoiceStatusFailed', { action: 'stop', error: error?.message });
      },
      onTimeout: () => {
        eInvoiceStatusPoller.stop();
        logger.log('EInvoice_QueryEInvoiceStatusTimeout');
      },
      timeout: E_INVOICE_STATUS_TIMEOUT,
      interval: E_INVOICE_STATUS_INTERVAL,
    });

    eInvoiceStatusPoller.start();
  } catch (error) {
    logger.error('EInvoice_QueryEInvoiceStatusFailed', { message: error?.message });

    throw error;
  }
};
