import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getCookieVariable, isWebview } from '../../../../common/utils';
import {
  E_INVOICE_STATUS,
  PATHS,
  E_INVOICE_TYPES,
  COUNTRIES,
  MALAYSIA_STATES,
  CLASSIFICATIONS,
} from '../../../utils/constants';

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
export const getIsLoadEInvoiceStatusPending = createSelector(
  getLoadEInvoiceStatusStatus,
  loadEInvoiceStatusStatus => loadEInvoiceStatusStatus === API_REQUEST_STATUS.PENDING
);

export const getIsLoadEInvoiceStatusFulfilled = createSelector(
  getLoadEInvoiceStatusStatus,
  loadEInvoiceStatusStatus => loadEInvoiceStatusStatus === API_REQUEST_STATUS.FULFILLED
);

export const getCurrentPageRoute = () => {
  const { pathname } = window.location;

  return pathname.replace(PATHS.E_INVOICE, '');
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

export const getIsQueryEInvoiceStatusSubmitted = createSelector(
  getQueryEInvoiceStatus,
  queryEInvoiceStatus => queryEInvoiceStatus === E_INVOICE_STATUS.SUBMITTED
);

export const getIsQueryEInvoiceSubmissionCompleted = createSelector(getQueryEInvoiceStatus, queryEInvoiceStatus =>
  [E_INVOICE_STATUS.VALID, E_INVOICE_STATUS.CANCEL, E_INVOICE_STATUS.REJECT].includes(queryEInvoiceStatus)
);

export const getIsQueryEInvoiceStatusBreak = createSelector(
  getQueryEInvoiceStatus,
  getLoadEInvoiceStatusError,
  (queryEInvoiceStatus, loadEInvoiceStatusError) =>
    (queryEInvoiceStatus && queryEInvoiceStatus !== E_INVOICE_STATUS.SUBMITTED) || !!loadEInvoiceStatusError
);

export const getIsLoadEInvoiceSubmissionDetailsPending = createSelector(
  getLoadEInvoiceSubmissionDetailStatus,
  loadEInvoiceSubmissionDetailStatus => loadEInvoiceSubmissionDetailStatus === API_REQUEST_STATUS.PENDING
);

export const getIsBusinessEInvoiceSubmission = createSelector(
  getEInvoiceSubmissionInfoType,
  eInvoiceSubmissionInfoType => [E_INVOICE_TYPES.BUSINESS].includes(eInvoiceSubmissionInfoType)
);

export const getCountries = () => {
  const countries = Object.values(COUNTRIES);

  return countries.map(country => ({
    id: country.countryCode,
    ...country,
  }));
};

export const getMalaysiaStates = () => {
  const states = Object.values(MALAYSIA_STATES);

  return states
    .map(state => ({
      id: state.state,
      ...state,
    }))
    .sort((previous, next) => previous.state - next.state);
};

export const getClassifications = () => {
  const classifications = Object.values(CLASSIFICATIONS);

  return classifications
    .map(classification => ({
      id: classification.classification,
      ...classification,
    }))
    .sort((previous, next) => previous.classification - next.classification);
};
