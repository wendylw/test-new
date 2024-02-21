import { get, post } from '../../../utils/api/api-fetch';

export const postUserMembership = ({ consumerId, business, source }) =>
  post(`/api/v3/consumers/${consumerId}/memberships`, {
    business,
    source,
  });

// export const getMembershipsInfo = business =>
//   get('/api/v3/memberships', {
//     queryParams: {
//       business,
//     },
//   });

export const getMembershipsInfo = async business => {
  const result = await get('http://127.0.0.1:4523/m1/2755399-0-default/api/v3/memberships', {
    queryParams: {
      business,
    },
  });

  return result.data;
};
