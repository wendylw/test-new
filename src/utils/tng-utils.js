import MessagePortal from './message-portal';
import debug from './debug';
import Utils from './utils';

export const TNG_MINI_PROGRAM_ENV_LIST = {
  SANDBOX: 'SBX',
  PRODUCTION: 'PROD',
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
    return result;
  } catch (error) {
    debug('[TNG utils] call fail method: %s\n parameter: %o\n error: %o', method, data, error);
    // eslint-disable-next-line no-console
    console.error(error);
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

export const getEnv = () => callMessagePortal('getEnv');

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

export const callTradePay = () => {
  try {
    window.my.tradePay({
      paymentUrl:
        'https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20210902111212800110171537101302190&timestamp=1630549491093&merchantId=217120000000855805277&sign=m9oeZKCz%252FP3auNNUId2JAhDAkiEAj0VdK4YBy2UnFpkZaV9buHffKdm1w%252BTnNR%252FG4GCbVDefPNIuwIDrB%252B5s8l%252Fkl3wur2os4PTfnKnWsIKd8%252FFoVDy5lN%252FfDxmXhoHFkuXiQSQxvamthLkS42ttIuH1ZOhvDYMoZOxeQVIV2UQpeF3fiXq3V1MQLNBnNh%252FCaY4dBqhcnqlUNL424hXjcT90cIER2SoGyK7y9NJsYXEPWGZ%252FhQD0cilbBsAkX6TEOQwm2EtbOU%252BU0PeyItAGm3JuN7USGxaxlqNPN8pZIEx%252FanNcrFUOn4VK6ZbfPyY6WpsICLDvTgdl6D4Oa%252FzvmQ%253D%253D',
      success: res => {
        window.my.alert({
          content: JSON.stringify(res),
        });
      },
      fail: res => {
        window.my.alert({
          content: JSON.stringify(res),
        });
      },
    });
  } catch (error) {
    console.error(error);

    throw error;
  }
};
