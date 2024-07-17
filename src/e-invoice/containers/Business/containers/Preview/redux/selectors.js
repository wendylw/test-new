import { createSelector } from 'reselect';
import i18next from 'i18next';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { POST_E_INVOICE_ERROR_CODES } from '../../../../../utils/constants';
import { getIsLoadEInvoiceStatusPending } from '../../../../../redux/modules/common/selectors';

export const getSubmitBusinessOrderForEInvoiceRequestData = state =>
  state.business.preview.submitBusinessOrderForEInvoiceRequest.data;

export const getSubmitBusinessOrderForEInvoiceRequestStatus = state =>
  state.business.preview.submitBusinessOrderForEInvoiceRequest.status;

export const getSubmitBusinessOrderForEInvoiceRequestError = state =>
  state.business.preview.submitBusinessOrderForEInvoiceRequest.error;

/**
 * Derived selectors
 */
export const getIsSubmitBusinessOrderForEInvoicePending = createSelector(
  getSubmitBusinessOrderForEInvoiceRequestStatus,
  submitBusinessOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.PENDING === submitBusinessOrderForEInvoiceRequestStatus
);

export const getIsBusinessSubmissionProcessingToastShow = createSelector(
  getIsLoadEInvoiceStatusPending,
  getIsSubmitBusinessOrderForEInvoicePending,
  (isLoadEInvoiceStatusPending, isSubmitBusinessOrderForEInvoicePending) =>
    isLoadEInvoiceStatusPending || isSubmitBusinessOrderForEInvoicePending
);

export const getIsSubmitBusinessOrderForEInvoiceFulfilled = createSelector(
  getSubmitBusinessOrderForEInvoiceRequestStatus,
  submitBusinessOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.FULFILLED === submitBusinessOrderForEInvoiceRequestStatus
);

export const getSubmitBusinessEInvoiceErrorMessage = createSelector(
  getSubmitBusinessOrderForEInvoiceRequestError,
  submitBusinessOrderForEInvoiceRequestError => {
    if (!submitBusinessOrderForEInvoiceRequestError) {
      return null;
    }

    const { code } = submitBusinessOrderForEInvoiceRequestError || {};
    const resultInfo = { code };

    switch (resultInfo.code) {
      case POST_E_INVOICE_ERROR_CODES.SUBMISSION_VERIFICATION_FAILED:
        resultInfo.title = i18next.t('EInvoice:ErrorSubmissionInfoVerificationFailedTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorSubmissionInfoVerificationFailedDescription');
        break;
      case POST_E_INVOICE_ERROR_CODES.IRBM_VERIFICATION_FAILED:
        resultInfo.title = i18next.t('EInvoice:ErrorIRBMVerificationFailedTitle');
        resultInfo.description = i18next.t('EInvoice:ErrorIRBMVerificationFailedDescription');
        break;
      default:
        resultInfo.title = i18next.t('Common:UnknownErrorTitle');
        resultInfo.description = i18next.t('Common:UnknownErrorDescription');
        break;
    }

    return resultInfo;
  }
);

export const getIsBusinessFormPageBack = createSelector(
  getSubmitBusinessEInvoiceErrorMessage,
  submitBusinessEInvoiceErrorMessage =>
    submitBusinessEInvoiceErrorMessage?.code &&
    [
      POST_E_INVOICE_ERROR_CODES.SUBMISSION_VERIFICATION_FAILED,
      POST_E_INVOICE_ERROR_CODES.IRBM_VERIFICATION_FAILED,
    ].includes(submitBusinessEInvoiceErrorMessage.code)
);
