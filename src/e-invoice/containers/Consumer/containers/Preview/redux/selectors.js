import { createSelector } from 'reselect';
import i18next from 'i18next';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { POST_E_INVOICE_ERROR_CODES } from '../../../../../utils/constants';
import { getIsLoadEInvoiceStatusPending } from '../../../../../redux/modules/common/selectors';

export const getSubmitMalaysianOrderForEInvoiceRequestData = state =>
  state.consumer.preview.submitMalaysianOrderForEInvoiceRequest.data;

export const getSubmitMalaysianOrderForEInvoiceRequestStatus = state =>
  state.consumer.preview.submitMalaysianOrderForEInvoiceRequest.status;

export const getSubmitMalaysianOrderForEInvoiceRequestError = state =>
  state.consumer.preview.submitMalaysianOrderForEInvoiceRequest.error;

export const getSubmitNonMalaysianOrderForEInvoiceRequestData = state =>
  state.consumer.preview.submitNonMalaysianOrderForEInvoiceRequest.data;

export const getSubmitNonMalaysianOrderForEInvoiceRequestStatus = state =>
  state.consumer.preview.submitNonMalaysianOrderForEInvoiceRequest.status;

export const getSubmitNonMalaysianOrderForEInvoiceRequestError = state =>
  state.consumer.preview.submitNonMalaysianOrderForEInvoiceRequest.error;

/**
 * Derived selectors
 */
export const getIsSubmitMalaysianOrderForEInvoicePending = createSelector(
  getSubmitMalaysianOrderForEInvoiceRequestStatus,
  submitMalaysianOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.PENDING === submitMalaysianOrderForEInvoiceRequestStatus
);

export const getIsMalaysianSubmissionProcessingToastShow = createSelector(
  getIsLoadEInvoiceStatusPending,
  getIsSubmitMalaysianOrderForEInvoicePending,
  (isLoadEInvoiceStatusPending, isSubmitMalaysianOrderForEInvoicePending) =>
    isLoadEInvoiceStatusPending || isSubmitMalaysianOrderForEInvoicePending
);

export const getIsSubmitMalaysianOrderForEInvoiceFulfilled = createSelector(
  getSubmitMalaysianOrderForEInvoiceRequestStatus,
  submitMalaysianOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.FULFILLED === submitMalaysianOrderForEInvoiceRequestStatus
);

export const getSubmitMalaysianEInvoiceErrorMessage = createSelector(
  getSubmitMalaysianOrderForEInvoiceRequestError,
  submitMalaysianOrderForEInvoiceRequestError => {
    if (!submitMalaysianOrderForEInvoiceRequestError) {
      return null;
    }

    const { code } = submitMalaysianOrderForEInvoiceRequestError || {};
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

export const getIsConsumerMalaysianFormPageBack = createSelector(
  getSubmitMalaysianEInvoiceErrorMessage,
  submitMalaysianEInvoiceErrorMessage =>
    submitMalaysianEInvoiceErrorMessage?.code &&
    [
      POST_E_INVOICE_ERROR_CODES.SUBMISSION_VERIFICATION_FAILED,
      POST_E_INVOICE_ERROR_CODES.IRBM_VERIFICATION_FAILED,
    ].includes(submitMalaysianEInvoiceErrorMessage.code)
);

export const getIsSubmitNonMalaysianOrderForEInvoicePending = createSelector(
  getSubmitNonMalaysianOrderForEInvoiceRequestStatus,
  submitNonMalaysianOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.PENDING === submitNonMalaysianOrderForEInvoiceRequestStatus
);

export const getIsNonMalaysianSubmissionProcessingToastShow = createSelector(
  getIsLoadEInvoiceStatusPending,
  getIsSubmitNonMalaysianOrderForEInvoicePending,
  (isLoadEInvoiceStatusPending, isSubmitNonMalaysianOrderForEInvoicePending) =>
    isLoadEInvoiceStatusPending || isSubmitNonMalaysianOrderForEInvoicePending
);

export const getIsSubmitNonMalaysianOrderForEInvoiceFulfilled = createSelector(
  getSubmitNonMalaysianOrderForEInvoiceRequestStatus,
  submitNonMalaysianOrderForEInvoiceRequestStatus =>
    API_REQUEST_STATUS.FULFILLED === submitNonMalaysianOrderForEInvoiceRequestStatus
);

export const getSubmitNonMalaysianEInvoiceErrorMessage = createSelector(
  getSubmitNonMalaysianOrderForEInvoiceRequestError,
  submitNonMalaysianOrderForEInvoiceRequestError => {
    if (!submitNonMalaysianOrderForEInvoiceRequestError) {
      return null;
    }

    const { code } = submitNonMalaysianOrderForEInvoiceRequestError || {};
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

export const getIsConsumerNonMalaysianFormPageBack = createSelector(
  getSubmitNonMalaysianEInvoiceErrorMessage,
  submitNonMalaysianEInvoiceErrorMessage =>
    submitNonMalaysianEInvoiceErrorMessage?.code &&
    [
      POST_E_INVOICE_ERROR_CODES.SUBMISSION_VERIFICATION_FAILED,
      POST_E_INVOICE_ERROR_CODES.IRBM_VERIFICATION_FAILED,
    ].includes(submitNonMalaysianEInvoiceErrorMessage.code)
);
