import _get from 'lodash/get';
import MessagePortal from './message-portal';
import debug from './debug';
import Utils from './utils';
import logger from './monitoring/logger';

export const TNG_MINI_PROGRAM_ENV_LIST = {
  SANDBOX: 'SBX',
  PRODUCTION: 'PROD',
};

export const getMessagePortalErrorData = errorMessage => {
  try {
    // WB-5331: Normally, TnG JS Bridge will return an error object with the following structure:
    // {
    //  error: '10',
    //  errorMessage: 'native node is null',
    //  message: 'native node is null',
    //  startTime: '3987877824'
    // }
    const data = JSON.parse(errorMessage);

    return {
      code: _get(data, 'error', ''),
      message: _get(data, 'errorMessage', ''),
    };
  } catch (e) {
    // If any unexpected error occurs, only return the original error message
    return { message: errorMessage };
  }
};

const initMessagePortal = () => {
  const messagePortal = new MessagePortal('TNGMiniProgram', window.my.postMessage);

  window.my.onMessage = data => {
    messagePortal.receiveRawMessage(data);
  };

  return messagePortal;
};

const getMessagePortal = () => {
  const self = getMessagePortal;

  if (!self.messagePortal) {
    self.messagePortal = initMessagePortal();
  }

  return self.messagePortal;
};

export const callMessagePortal = async (method, data) => {
  try {
    debug('[TNG utils] before call method: %s\n parameter: %o', method, data);
    const messagePortal = getMessagePortal();
    const result = await messagePortal.call(method, data);
    debug('[TNG utils] call success method: %s\n parameter: %o\n result: %o', method, data, result);
    logger.log('Utils_MessagePortal_CallAPISucceeded', { method });
    return result;
  } catch (error) {
    debug('[TNG utils] call fail method: %s\n parameter: %o\n error: %o', method, data, error);
    const errorData = getMessagePortalErrorData(error?.message);

    logger.error('Utils_MessagePortal_CallAPIFailed', {
      method,
      ...errorData,
      stack: _get(error, 'stack', ''),
    });
    throw error;
  }
};

export const getLocation = () =>
  new Promise((resolve, reject) => {
    if (Utils.isTNGMiniProgram()) {
      window.my.getLocation({
        success: result => {
          resolve({
            latitude: parseFloat(result.latitude, 10),
            longitude: parseFloat(result.longitude, 10),
            accuracy: parseFloat(result.accuracy, 10),
            horizontalAccuracy: parseFloat(result.horizontalAccuracy, 10),
          });
        },
        fail: err => {
          reject(err);
        },
      });
    } else {
      reject(new Error('Not in TNG Mini Program.'));
    }
  });

export const getAccessToken = data => callMessagePortal('getAccessToken', data);

export const getEnv = async () => {
  const messagePortal = getMessagePortal();
  const result = await messagePortal.call('getEnv');
  return result;
};

export const isRequiredDevTools = async () => {
  if (!Utils.isTNGMiniProgram()) {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const env = await getEnv();
    return env === TNG_MINI_PROGRAM_ENV_LIST.SANDBOX;
  } catch {
    return false;
  }
};

export const setTabBarVisibility = async visible => {
  try {
    await callMessagePortal('setTabBarVisibility', visible);
  } catch (e) {
    logger.error('Utils_TngMiniProgram_SetTabBarVisibility', { message: e.message });
  }
};

export const callTradePay = paymentUrl =>
  new Promise((resolve, reject) => {
    if (Utils.isTNGMiniProgram()) {
      window.my.tradePay({
        paymentUrl,
        success: result => {
          resolve(result);
        },
        fail: err => {
          reject(err);
        },
      });
    } else {
      reject(new Error('Not in TNG Mini Program.'));
    }
  });
