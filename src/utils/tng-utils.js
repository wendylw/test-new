import MessagePortal from './message-portal';
import debug from './debug';

// eslint-disable-next-line no-underscore-dangle
export const isTNGMiniProgram = () => window._isTNGMiniProgram_;

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
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
};

export const getLocation = () =>
  new Promise((resolve, reject) => {
    if (isTNGMiniProgram()) {
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
