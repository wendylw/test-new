import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getCookieVariable, isWebview } from '../../../../common/utils';
import { E_INVOICE_STATUS, AVAILABLE_QUERY_E_INVOICE_STATUS_ROUTES, E_INVOICE_TYPES } from '../../../utils/constants';

export const getIsWebview = () => isWebview();

export const getHash = () => getCookieVariable('__sh_ei_h');

export const getEInvoiceMerchantName = () => getCookieVariable('__sh_ei_merchantName');

export const getEInvoiceReceiptNumber = () => getCookieVariable('__sh_ei_receiptNumber');

export const getEInvoiceChannel = () => getCookieVariable('__sh_ei_channel');

export const getLoadEInvoiceStatusData = state => state.common.loadEInvoiceStatusRequest.data;

export const getLoadEInvoiceStatusStatus = state => state.common.loadEInvoiceStatusRequest.status;

export const getLoadEInvoiceStatusError = state => state.common.loadEInvoiceStatusRequest.error;

export const getQueryEInvoiceStatus = createSelector(getLoadEInvoiceStatusData, loadEInvoiceStatusData =>
  _get(loadEInvoiceStatusData, 'status', null)
);

export const getLoadEInvoiceSubmissionDetailData = state => state.common.loadEInvoiceSubmissionDetailRequest.data;

export const getLoadEInvoiceSubmissionDetailStatus = state => state.common.loadEInvoiceSubmissionDetailRequest.status;

export const getLoadEInvoiceSubmissionDetailError = state => state.common.loadEInvoiceSubmissionDetailRequest.error;

export const getEInvoiceSubmissionInfoType = createSelector(
  getLoadEInvoiceSubmissionDetailData,
  loadEInvoiceSubmissionDetailData => _get(loadEInvoiceSubmissionDetailData, 'type', '')
);

/**
 * Derived selectors
 */
export const getIsAvailableQuerySubmissionPage = () => {
  const { pathname } = window.location;
  const routes = Object.values(AVAILABLE_QUERY_E_INVOICE_STATUS_ROUTES);
  const isAvailableQuerySubmissionPage = routes.some(route => route === pathname || `${route}/` === pathname);

  return isAvailableQuerySubmissionPage;
};

export const getQuerySubmissionPagePollerKey = () => {
  const { pathname } = window.location;

  return Object.keys(AVAILABLE_QUERY_E_INVOICE_STATUS_ROUTES).find(key => {
    const route = AVAILABLE_QUERY_E_INVOICE_STATUS_ROUTES[key];

    return route === pathname || `${route}/` === pathname;
  });
};

export const getIsQueryEInvoiceStatusValid = createSelector(
  getQueryEInvoiceStatus,
  queryEInvoiceStatus => queryEInvoiceStatus === E_INVOICE_STATUS.VALID
);

export const getIsQueryEInvoiceStatusCancel = createSelector(
  getQueryEInvoiceStatus,
  queryEInvoiceStatus => queryEInvoiceStatus === E_INVOICE_STATUS.CANCEL
);

export const getIsQueryEInvoiceStatusRejected = createSelector(
  getQueryEInvoiceStatus,
  queryEInvoiceStatus => queryEInvoiceStatus === E_INVOICE_STATUS.REJECT
);

export const getIsQueryEInvoiceSubmissionCompleted = createSelector(getQueryEInvoiceStatus, queryEInvoiceStatus =>
  [E_INVOICE_STATUS.VALID, E_INVOICE_STATUS.CANCEL, E_INVOICE_STATUS.REJECT].includes(queryEInvoiceStatus)
);

export const getIsQueryEInvoiceStatusBreak = createSelector(
  getQueryEInvoiceStatus,
  getLoadEInvoiceStatusError,
  (queryEInvoiceStatus, loadEInvoiceStatusError) =>
    queryEInvoiceStatus !== E_INVOICE_STATUS.SUBMITTED || !!loadEInvoiceStatusError
);

export const getIsBusinessEInvoiceSubmission = createSelector(
  getEInvoiceSubmissionInfoType,
  eInvoiceSubmissionInfoType => [E_INVOICE_TYPES.BUSINESS].includes(eInvoiceSubmissionInfoType)
);
