import { post } from '../../../../../../utils/api/api-fetch';

// export const postClaimUniquePromo = ({ id, consumerId, source, business: businessName }) =>
//   post(`/api/v3/rewards-sets/${id}/redeem`, {
//     consumerId,
//     source,
//     businessName,
//   });

export const postClaimUniquePromo = () =>
  post('http://127.0.0.1:4523/m1/2755399-0-0a18a6d8/api/v3/rewards-sets/1/redeem?apifoxResponseId=338581286');
