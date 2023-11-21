import { get, post } from '../../../utils/api/api-fetch';

export const getProfileInfo = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);

export const getVoucherConsumerList = consumerId => get(`/api/consumers/${consumerId}/vouchers`);

export const getSearchPromotionInfo = ({ consumerId, business, promoCode }) =>
  get(`/api/consumers/${consumerId}/vouchers`, {
    queryParams: {
      business,
      search: promoCode,
    },
  });

export const postLoginGuest = () => post('/api/login/guest');

export const getUrlAccessValidation = () => get('/api/v3/urls/validation');
