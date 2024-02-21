import { get, post } from '../../../utils/api/api-fetch';

export const postUserMembership = ({ consumerId, business, source }) =>
  post(`/api/v3/consumers/${consumerId}/memberships`, {
    business,
    source,
  });

export const getMembershipsInfo = business =>
  get('/api/v3/memberships', {
    queryParams: {
      business,
    },
  });
