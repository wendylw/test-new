import ReactDOM from 'react-dom';

/**
 * Feedback Status
 */
export const FEEDBACK_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

/**
 * Feedback Type
 */
export const ERROR_TYPES = {
  ALERT: 'alert',
  FULL_SCREEN: 'fullScreen',
  CONFIRM: 'confirm',
  NOTIFICATION: 'notification',
};

/**
 *
 * Feedback buttons style types
 */

export const BUTTONS_STYLE_TYPES = {
  FILL: 'fill',
  OUTLINE: 'outline',
  LINK: 'link',
};

export const destroyTarget = target => {
  ReactDOM.unmountComponentAtNode(target);

  target.remove();
};
