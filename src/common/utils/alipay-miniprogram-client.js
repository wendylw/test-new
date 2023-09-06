import MessagePortal from '../../utils/message-portal';
import debug from '../../utils/debug';
import { isTNGMiniProgram, isGCashMiniProgram } from './index';
import logger from '../../utils/monitoring/logger';

export const ALIPAY_MINI_PROGRAM_ENV_LIST = {
  SANDBOX: 'SBX',
  PRODUCTION: 'PROD',
};

export const isAlipayMiniProgram = () => isTNGMiniProgram() || isGCashMiniProgram();

const getMessagePortalName = () => {
  if (isTNGMiniProgram()) {
    return 'TNGMiniProgram';
  }

  if (isGCashMiniProgram()) {
    return 'GCashMiniProgram';
  }

  return '';
};

const initMessagePortal = () => {
  const messagePortalName = getMessagePortalName();

  const messagePortal = new MessagePortal(messagePortalName, window.my.postMessage);

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

export const getEnv = async () => {
  try {
    const messagePortal = getMessagePortal();
    const result = await messagePortal.call('getEnv');
    return result;
  } catch (error) {
    logger.error('Common_AlipayMiniProgram_getEnv', { message: error.message });

    throw error;
  }
};

export const isRequiredAlipayMiniProgramDevTools = async () => {
  if (!isAlipayMiniProgram()) {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const env = await getEnv();
    return env === ALIPAY_MINI_PROGRAM_ENV_LIST.SANDBOX;
  } catch {
    return false;
  }
};

const callMessagePortal = async (method, data) => {
  try {
    debug('[Alipay utils] before call method: %s\n parameter: %o', method, data);
    const messagePortal = getMessagePortal();
    const result = await messagePortal.call(method, data);
    debug('[Alipay utils] call success method: %s\n parameter: %o\n result: %o', method, data, result);
    return result;
  } catch (error) {
    debug('[Alipay utils] call fail method: %s\n parameter: %o\n error: %o', method, data, error);

    logger.error('Common_AlipayMiniProgram_CallMessagePortal', { message: error.message });

    throw error;
  }
};

export const getAccessToken = data => callMessagePortal('getAccessToken', data);

export const setTngMPTabBarVisibility = async visible => {
  try {
    await callMessagePortal('setTabBarVisibility', visible);
  } catch (error) {
    logger.error('Common_AlipayMiniProgram_SetTabBarVisibility', { message: error.message });

    throw error;
  }
};

export const getLocationForAlipayMiniProgram = () =>
  new Promise((resolve, reject) => {
    if (isAlipayMiniProgram()) {
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
      reject(new Error('Not in Alipay Mini Program.'));
    }
  });

export const callTradePay = paymentUrl =>
  new Promise((resolve, reject) => {
    if (isAlipayMiniProgram()) {
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
      reject(new Error('Not in Alipay Mini Program.'));
    }
  });
