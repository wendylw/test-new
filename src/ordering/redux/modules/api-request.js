import { get, post } from '../../../utils/api/api-fetch';

export const getProfileInfo = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);

// shippingType field: https://storehub.atlassian.net/browse/WB-8827
export const getVoucherConsumerList = (consumerId, shippingType) =>
  get(`/api/consumers/${consumerId}/vouchers`, {
    queryParams: { shippingType },
  });

export const getSearchPromotionInfo = ({ consumerId, business, promoCode }) =>
  get(`/api/consumers/${consumerId}/vouchers`, {
    queryParams: {
      business,
      search: promoCode,
    },
  });

export const postLoginGuest = () => post('/api/login/guest');

export const getUrlsValidation = h =>
  get('/api/v3/urls/validation', {
    queryParams: { h },
  });

export const getCustomerInfo = ({ consumerId, business, pointsTotalEarned = false, rewardsTotal = false }) =>
  get(`/api/v3/consumers/${consumerId}/customer`, {
    queryParams: {
      business,
      pointsTotalEarned,
      rewardsTotal,
    },
  });
