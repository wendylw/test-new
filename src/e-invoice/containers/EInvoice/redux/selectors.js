import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getPrice } from '../../../../common/utils';
import {
  E_INVOICE_STATUS,
  GET_E_INVOICE_STATUS_ERROR_CODES,
  SUBMITTED_TIMEOUT_ERROR_MESSAGE,
} from '../../../utils/constants';
import {
  GET_E_INVOICE_ERROR_CODES,
  STATUS_TAG_COLORS,
  STATUS_I18N_KEYS,
  E_INVOICE_DOCUMENT_TYPES,
} from '../utils/constants';
import { getFormatLocaleDateTime } from '../../../../utils/datetime-lib';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../redux/modules/merchant/selectors';
import { getLoadEInvoiceStatusError } from '../../../redux/modules/common/selectors';

export const getLoadEInvoiceData = state => state.eInvoice.loadEInvoiceRequest.data;

export const getLoadEInvoiceStatus = state => state.eInvoice.loadEInvoiceRequest.status;

export const getLoadEInvoiceError = state => state.eInvoice.loadEInvoiceRequest.error;

export const getEInvoiceCreateTime = createSelector(getLoadEInvoiceData, loadEInvoiceData =>
  _get(loadEInvoiceData, 'createdTime', '')
);

export const getEInvoiceTotal = createSelector(getLoadEInvoiceData, loadEInvoiceData =>
  _get(loadEInvoiceData, 'total', '')
);

export const getEInvoiceStoreName = createSelector(getLoadEInvoiceData, loadEInvoiceData =>
  _get(loadEInvoiceData, 'storeInfo.companyName', '')
);

export const getEInvoiceInfo = createSelector(getLoadEInvoiceData, loadEInvoiceData =>
  _get(loadEInvoiceData, 'eInvoice', null)
);

export const getEInvoiceStatus = createSelector(getEInvoiceInfo, eInvoiceInfo => _get(eInvoiceInfo, 'status', null));

export const getEInvoiceInternalEInvoiceUrl = createSelector(getEInvoiceInfo, eInvoiceInfo =>
  _get(eInvoiceInfo, 'internalEInvoiceUrl', '')
);

export const getEInvoiceExternalEInvoiceUrl = createSelector(getEInvoiceInfo, eInvoiceInfo =>
  _get(eInvoiceInfo, 'externalEInvoiceUrl', '')
);

export const getEInvoiceReferenceNumber = createSelector(getEInvoiceInfo, eInvoiceInfo =>
  _get(eInvoiceInfo, 'externalDocumentId', '')
);

export const getEInvoiceDocumentType = createSelector(getEInvoiceInfo, eInvoiceInfo =>
  _get(eInvoiceInfo, 'eInvoiceDocumentType', null)
);

export const getEInvoiceSubmittedTimeoutError = state => state.eInvoice.timeoutError;

/**
 * Derived selectors
 */
export const getIsLoadEInvoiceCompleted = createSelector(getLoadEInvoiceStatus, loadEInvoiceStatus =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadEInvoiceStatus)
);

export const getIsEInvoiceCanceled = createSelector(
  getEInvoiceStatus,
  eInvoiceStatus => eInvoiceStatus === E_INVOICE_STATUS.CANCEL
);

export const getIsEInvoiceSubmitted = createSelector(
  getEInvoiceStatus,
  eInvoiceStatus => eInvoiceStatus === E_INVOICE_STATUS.SUBMITTED
);

export const getIsEInvoiceValid = createSelector(
  getEInvoiceStatus,
  eInvoiceStatus => eInvoiceStatus === E_INVOICE_STATUS.VALID
);

export const getIsEInvoiceReject = createSelector(
  getEInvoiceStatus,
  eInvoiceStatus => eInvoiceStatus === E_INVOICE_STATUS.REJECT
);

export const getEInvoiceStatusColor = createSelector(
  getEInvoiceStatus,
  eInvoiceStatus => STATUS_TAG_COLORS[eInvoiceStatus]
);

export const getEInvoiceStatusTagInfo = createSelector(getEInvoiceStatus, eInvoiceStatus => ({
  text: i18next.t(`EInvoice:${STATUS_I18N_KEYS[eInvoiceStatus]}`),
  color: STATUS_TAG_COLORS[eInvoiceStatus],
}));

export const getFormattedEInvoiceCreateTime = createSelector(getEInvoiceCreateTime, eInvoiceCreateTime =>
  getFormatLocaleDateTime({
    dateTime: eInvoiceCreateTime,
    formatter: 'YYYY.MM.DD HH:mm:ss',
  })
);

export const getEInvoiceOrderTotalPrice = createSelector(
  getEInvoiceTotal,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (eInvoiceTotal, merchantCountry, merchantCurrency, merchantLocale) =>
    getPrice(eInvoiceTotal, {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    })
);

export const getIsEInvoiceOrderNotFound = createSelector(
  getLoadEInvoiceError,
  loadEInvoiceError => loadEInvoiceError?.code === GET_E_INVOICE_ERROR_CODES.ORDER_NOT_FOUND
);

export const getIsEInvoiceOrderCancelledOrRefunded = createSelector(
  getLoadEInvoiceError,
  loadEInvoiceError => loadEInvoiceError?.code === GET_E_INVOICE_ERROR_CODES.ORDER_CANCELLED_OR_REFUNDED
);

export const getEInvoiceErrorResultInfo = createSelector(
  getLoadEInvoiceError,
  getLoadEInvoiceStatusError,
  getEInvoiceSubmittedTimeoutError,
  (loadEInvoiceError, loadEInvoiceStatusError, eInvoiceSubmittedTimeoutError) => {
    const { code: getEInvoiceErrorCode } = loadEInvoiceError || {};
    const { code: getEInvoiceStatusErrorCode } = loadEInvoiceStatusError || {};
    let resultInfo = { code: getEInvoiceErrorCode || getEInvoiceStatusErrorCode };

    // local error
    if (eInvoiceSubmittedTimeoutError) {
      resultInfo.code = eInvoiceSubmittedTimeoutError;
    }

    switch (resultInfo.code) {
      case GET_E_INVOICE_ERROR_CODES.ORDER_NOT_FOUND:
        resultInfo.title = i18next.t('EInvoice:ErrorOrderNotFoundTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorOrderNotFoundDescription');
        break;
      case GET_E_INVOICE_ERROR_CODES.ORDER_TRANSACTION_TYPE_NOT_SUPPORT:
        resultInfo.title = i18next.t('EInvoice:ErrorOrderTransactionTypeNotSupportTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorOrderTransactionTypeNotSupportDescription');
        break;
      case GET_E_INVOICE_ERROR_CODES.ORDER_CANCELLED_OR_REFUNDED:
        resultInfo.title = i18next.t('EInvoice:ErrorOrderCanceledOrRefundedTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorOrderCanceledOrRefundedDescription');
        break;
      case GET_E_INVOICE_STATUS_ERROR_CODES.NO_E_INVOICE_SUBMIT_RECORD:
        resultInfo.title = i18next.t('EInvoice:ErrorNoEInvoiceSubmitRecordTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorNoEInvoiceSubmitRecordDescription');
        break;
      case SUBMITTED_TIMEOUT_ERROR_MESSAGE:
        resultInfo.title = i18next.t('EInvoice:ErrorNoEInvoiceSubmitRecordTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorNoEInvoiceSubmitRecordDescription');
        break;
      default:
        resultInfo = null;
    }

    return resultInfo;
  }
);

export const getIsEInvoiceDataInitialized = createSelector(
  getIsLoadEInvoiceCompleted,
  isLoadEInvoiceCompleted => isLoadEInvoiceCompleted
);

export const getIsEInvoiceDocumentTypeRefund = createSelector(
  getEInvoiceDocumentType,
  eInvoiceDocumentType => eInvoiceDocumentType === E_INVOICE_DOCUMENT_TYPES.REFUND
);
