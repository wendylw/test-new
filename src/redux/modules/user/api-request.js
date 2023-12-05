import { get, post } from '../../../utils/api/api-fetch';

export const getUserLoginStatus = () => get('/api/ping');

export const postUserLogin = ({
  accessToken,
  refreshToken,
  fulfillDate,
  shippingType,
  registrationTouchpoint,
  registrationSource,
}) =>
  post('/api/login', {
    accessToken,
    refreshToken,
    fulfillDate,
    shippingType,
    registrationTouchpoint,
    registrationSource,
  });

export const postLoginGuest = () => post('/api/login/guest');

export const getUserProfile = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);
