import { post } from '../../../../../../utils/api/api-fetch';

export const postClaimUniquePromo = ({ id }) => post(`/api/v3/rewards-sets/${id}/redeem`);
