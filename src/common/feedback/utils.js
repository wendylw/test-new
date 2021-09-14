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

// export function handleApiErrorAction(error) {
//   const { status } = error;

//   if (!status) {
//     if (process.env.NODE_ENV !== 'production') {
//       /* eslint-disable */
//       console.error('API ERROR:', error);
//       /* eslint-enable */
//     }

//     return handleApiError();
//   }

//   return handleApiError({
//     status,
//     fbType: FEEDBACK_TYPE.ALERT,
//     fbStatus: FEEDBACK_STATUS.ERROR,
//   });
// }
