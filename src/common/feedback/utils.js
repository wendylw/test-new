import ReactDOM from 'react-dom';

/**
 * Feedback Component Type
 * Components: message, modal, notification
 */
export const FEEDBACK_TYPE = {
  ALERT: 'ALERT',
  CONFIRM: 'CONFIRM',
  TOAST: 'TOAST',
  FULL_SCREEN: 'FULL_SCREEN',
};

/**
 * Feedback Status for message, modal, notification
 */
export const FEEDBACK_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

export const destroyTarget = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};
