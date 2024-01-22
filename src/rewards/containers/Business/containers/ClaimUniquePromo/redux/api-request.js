import { post } from '../../../../../../utils/api/api-fetch';

// export const postClaimUniquePromo = ({ id }) => post(`/api/v3/rewards-sets/${id}/redeem`);
export const postClaimUniquePromo = () =>
  post(`http://127.0.0.1:4523/m1/2755399-0-default/api/v3/rewards-sets/1/redeem`);
