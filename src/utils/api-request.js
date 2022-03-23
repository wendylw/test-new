import { get, post } from './api/api-fetch';
import Utils from './utils';
import CleverTap from './clevertap';

export const login = ({ accessToken, refreshToken, fulfillDate }) =>
  post('/api/login', {
    accessToken,
    refreshToken,
    fulfillDate,
    registrationTouchpoint: Utils.getRegistrationTouchPoint(),
    registrationSource: Utils.getRegistrationSource(),
  }).then(data => {
    if (!data?.consumerId) {
      return data;
    }

    if (!data.user) {
      return data;
    }

    const { user } = data;

    const userInfo = {
      Name: user.firstName,
      Phone: user.phone,
      Identity: data.consumerId,
      Email: user.email,
      DOB: user.birthday ? new Date(user.birthday) : undefined,
    };

    CleverTap.pushEvent('Login - login successful', {
      'new user': user.isFirstLogin,
    });

    CleverTap.onUserLogin(userInfo);

    return data;
  });

export const fetchOrder = receiptNumber => get(`/api/v3/transactions/${receiptNumber}/calculation`);
