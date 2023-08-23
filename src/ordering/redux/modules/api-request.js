import { get, post } from '../../../utils/api/api-fetch';

export const getProfileInfo = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);

export const getVoucherConsumerList = consumerId => get(`/api/v3/consumers/${consumerId}/vouchers`);

export const getSearchPromotionInfo = ({ consumerId, business, promoCode }) =>
  get(`/api/v3/consumers/${consumerId}/vouchers`, {
    queryParams: {
      business,
      promoCode,
    },
  });

export const postLoginGuest = () => post('/api/login/guest');
