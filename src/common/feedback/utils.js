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
