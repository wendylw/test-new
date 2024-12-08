import ReactDOM from 'react-dom';

/**
 * Feedback Status for message, modal, notification
 */
export const FEEDBACK_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const TOAST_DEFAULT_DURATION = 4500;

export const CONFIRM_BUTTON_ALIGNMENT = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
};

export const CONFIRM_TRIGGER_TARGET = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  OTHER: 'other',
};

export const destroyTarget = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};
