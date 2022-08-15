import ReactDOM from 'react-dom';

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
