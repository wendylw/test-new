import { get } from '../../../../../../utils/api/api-fetch';

// export const getUniquePromoList = async ({ consumerId, business }) =>
//   get(`/api/v3/consumers/${consumerId}/unique-promos`, {
//     queryParams: {
//       business,
//     },
//   });
export const getUniquePromoList = async ({ business }) =>
  get('http://127.0.0.1:4523/m1/2755399-0-default/api/v3/consumers/1/unique-promos', {
    queryParams: {
      business,
    },
  });
