import { get, post, put } from '../../../utils/api/api-fetch';

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

export const putProfileInfo = (consumerId, { firstName, email, birthday }) =>
  put(`/api/v3/consumers/${consumerId}/profile`, { firstName, email, birthday });
