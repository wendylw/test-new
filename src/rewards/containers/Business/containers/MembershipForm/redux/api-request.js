import { get } from '../../../../../../utils/api/api-fetch';

export const getBusinessInfo = business =>
  get('/api/v3/memberships', {
    queryParams: {
      business,
    },
  });
