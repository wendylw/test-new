import { get } from '../../../../utils/api/api-fetch';

export const getMerchantInfo = business => get(`/api/v3/merchants/${business}`);
