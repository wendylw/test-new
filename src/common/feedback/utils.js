// export const FEEDBACKS = {
//   400: {
//     buttonText: 'Common:Close',
//   },
//   401: {
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Continue',
//   },
//   403: {
//     buttonText: 'Common:Close',
//   },
//   404: {
//     buttonText: 'Common:Close',
//   },
//   500: {
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Close',
//   },
//   40000: {
//     title: 'ApiError:40000Title',
//     desc: 'ApiError:40000Description',
//     redirectUrl: '',
//     buttonText: 'Common:TryAgain',
//   },
//   40001: {
//     title: 'ApiError:40001Title',
//     desc: 'ApiError:40001Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Continue',
//   },
//   40002: {
//     title: 'ApiError:40002Title',
//     desc: 'ApiError:40002Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Continue',
//   },
//   40003: {
//     title: 'ApiError:40003Title',
//     desc: 'ApiError:40003Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Continue',
//   },
//   40009: {
//     title: 'ApiError:40009Title',
//     desc: 'ApiError:40009Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
//     buttonText: 'Common:Continue',
//   },
//   40012: {
//     title: 'ApiError:40012Title',
//     desc: 'ApiError:40012Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
//     buttonText: 'Common:Continue',
//   },
//   40013: {
//     title: 'ApiError:40013Title',
//     desc: 'ApiError:40013Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`,
//     buttonText: 'Common:Continue',
//   },
//   40015: {
//     title: 'ApiError:40015Title',
//     desc: 'ApiError:40015Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
//     buttonText: 'Common:Continue',
//   },
//   40016: {
//     title: 'ApiError:40016Title',
//     desc: 'ApiError:40016Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
//     buttonText: 'Common:Continue',
//   },
//   40017: {
//     title: 'ApiError:40017Title',
//     desc: 'ApiError:40017Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
//     buttonText: 'Common:Continue',
//   },
//   40018: {
//     title: 'ApiError:40018Title',
//     desc: 'ApiError:40018Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
//     buttonText: 'Common:Continue',
//   },
//   40019: {
//     title: 'ApiError:40019Title',
//     desc: 'ApiError:40019Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
//     buttonText: 'Common:Continue',
//   },
//   40020: {
//     title: 'ApiError:40020Title',
//     desc: 'ApiError:40020Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
//     buttonText: 'Common:Continue',
//   },
//   40022: {
//     title: 'ApiError:40022Title',
//     desc: 'ApiError:40022Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
//     buttonText: 'Common:Continue',
//   },
//   40024: {
//     title: 'ApiError:40024Title',
//     desc: 'ApiError:40024Description',
//     redirectUrl: '',
//     buttonText: 'Common:Continue',
//   },
//   40025: {
//     title: 'ApiError:40025Title',
//     desc: 'ApiError:40025Description',
//     redirectUrl: '',
//     buttonText: 'Common:Continue',
//   },
//   40026: {
//     title: 'ApiError:40026Title',
//     desc: 'ApiError:40026Description',
//     redirectUrl: '',
//     buttonText: 'Common:Continue',
//   },
//   41000: {
//     title: 'ApiError:41000Title',
//     desc: 'ApiError:41000Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
//     buttonText: 'Common:Continue',
//   },
//   41014: {
//     title: 'ApiError:41014Title',
//     desc: 'ApiError:41014Description',
//     redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`,
//     buttonText: 'Common:Reorder',
//   },
// };

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
