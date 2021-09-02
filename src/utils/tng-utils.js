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
        'https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20210902111212800110171912901303918&timestamp=1630556110815&merchantId=217120000000855805277&sign=WNaoo1NV7Vhx9oxfK%252Bbis9bd2x9Oi0MTDVmkZHsvdHdqvOxCin%252BJgipzCZSeSAbTQt22Fk1vc%252Bb0zVTWMa%252FOrYzpE76%252FxIKBGhgk5ZTz9xIdamS6BQX8kLUnJL5KgEmYL7m1HV8qzRIkPMcoh2Uwvt9gLyVQdwzyDkFtUjsdIVemObC9xjUynxW0%252F9QAUdUlYJdvUq6GakmJYaozcuqBF7xsj4qc6NKa5TxuiAr%252FZKbQ0JuAoZ4cUY0lQisSOXMixkXycip7Jso5R52a%252B0MAnnLZzJwMuafPf8R939%252BuCppayesxdOoC5zhhFLDmnJqwrS0RK3PBFAZU7D72EYsgzg%253D%253D',
      success: res => {
        window.my.alert({
          content: JSON.stringify(res),
        });

        const form = document.createElement('form');
        const data = {
          receiptNumber: '1630556109711',
          paymentId: '20210902111212800110171912901303918',
          paymentMethod: 'TngMiniProgram',
          status: 'Success',
          amount: '0.01',
        };
        form.action = process.env.REACT_APP_STOREHUB_PAYMENT_RESPONSE_URL;
        form.method = 'POST';
        form.style.height = 0;
        form.style.width = 0;
        form.style.overflow = 'hidden';
        form.style.visibility = 'hidden';
        Object.keys(data).forEach(key => {
          const input = document.createElement('input');
          input.name = key;
          input.value = data[key];
          input.type = 'hidden';
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
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
