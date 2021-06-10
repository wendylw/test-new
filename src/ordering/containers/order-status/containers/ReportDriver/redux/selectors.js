import _get from 'lodash/get';
import { initialState } from './index';
import { createSelector } from 'reselect';
import { REPORT_DRIVER_REASONS, REPORT_DRIVER_FIELD_NAMES, SUBMIT_STATUS } from '../constants';

export const getInputNotes = state => {
  return _get(state.orderStatus.reportDriver, 'inputNotes', initialState.inputNotes);
};

export const getSelectedReasonCode = state => {
  return _get(state.orderStatus.reportDriver, 'selectedReasonCode', initialState.selectedReasonCode);
};

export const getSelectedReasonFields = createSelector([getSelectedReasonCode], reasonCode => {
  const reason = REPORT_DRIVER_REASONS.find(reason => {
    return reason.code === reasonCode;
  });
  return _get(reason, 'fields', []);
});

export const getSubmitStatus = state => {
  return _get(state.orderStatus.reportDriver, 'submitStatus', initialState.submitStatus);
};

export const getShowPageLoader = state => {
  return _get(state.orderStatus.reportDriver, 'showPageLoader', initialState.showPageLoader);
};

export const getUploadPhotoFile = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.file', null);
};

export const getUploadPhotoUrl = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.url', '');
};

export const getUploadPhotoLocation = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.location', '');
};

export const getInputEmail = state => _get(state.orderStatus.reportDriver, 'inputEmail', initialState.inputEmail);

export const getInputEmailValue = state => _get(state.orderStatus.reportDriver, 'inputEmail.value', '');

export const getInputEmailIsCompleted = state => _get(state.orderStatus.reportDriver, 'inputEmail.isCompleted', false);

export const getInputEmailIsValid = state => _get(state.orderStatus.reportDriver, 'inputEmail.isValid', false);

export const getSelectedReasonNoteField = createSelector(getSelectedReasonFields, selectedReasonFields =>
  selectedReasonFields.find(field => field.name === REPORT_DRIVER_FIELD_NAMES.NOTES)
);

export const getSelectedReasonPhotoField = createSelector(getSelectedReasonFields, selectedReasonFields =>
  selectedReasonFields.find(field => field.name === REPORT_DRIVER_FIELD_NAMES.PHOTO)
);

export const getIsSubmitButtonDisabled = createSelector(
  getSelectedReasonCode,
  getInputNotes,
  getUploadPhotoFile,
  getInputEmailValue,
  getSubmitStatus,
  getSelectedReasonNoteField,
  getSelectedReasonPhotoField,
  (
    selectedReasonCode,
    inputNotes,
    uploadPhotoFile,
    inputEmailValue,
    submitStatus,
    selectedReasonNoteField,
    selectedReasonPhotoField
  ) => {
    if (!selectedReasonCode) {
      return true;
    }

    if (submitStatus !== SUBMIT_STATUS.NOT_SUBMIT) {
      return true;
    }

    if (selectedReasonNoteField && selectedReasonNoteField.required && inputNotes.length === 0) {
      return true;
    }

    if (selectedReasonPhotoField && selectedReasonPhotoField.required && !uploadPhotoFile) {
      return true;
    }

    if (inputEmailValue.length === 0) {
      return true;
    }

    return false;
  }
);

export const getSubmittable = createSelector(
  getIsSubmitButtonDisabled,
  getInputEmailIsValid,
  (isSubmitButtonDisabled, inputEmailIsValid) => {
    if (isSubmitButtonDisabled) {
      return false;
    }

    if (!inputEmailIsValid) {
      return false;
    }

    return true;
  }
);
